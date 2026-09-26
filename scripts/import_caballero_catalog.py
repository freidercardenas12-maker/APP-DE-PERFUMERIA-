"""Attach bottle photos and wholesale prices from the men's catalog PDF."""

import hashlib
import io
import json
import re
import unicodedata
from datetime import datetime, timezone
from difflib import SequenceMatcher
from pathlib import Path

import pymupdf
from PIL import Image

ROOT = Path(r"C:\Users\gdocumental\Downloads\APP PERFUMES")
PDF = ROOT / "PERFUMES HOMBRES" / "CATALOGO_CABALLERO_PRECIO_MAYORISTA.pdf"
PRODUCTS = ROOT / "data" / "products.json"
OUT_DIR = ROOT / "public" / "catalogo" / "caballero"

PRICE_RE = re.compile(r"^\$(\d{1,3}(?:\.\d{3})+)")
BARE_PRICE_RE = re.compile(r"^(\d{2,3}\.\d{3})")
ML_RE = re.compile(r"^(\d+)ML$", re.I)
NOISE = {"VER", "VIDEO", "DISPONIBILIDAD", "1.1", "1.1."}


def norm(value: str) -> str:
    text = unicodedata.normalize("NFKD", value)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = text.lower()
    text = re.sub(r"\b1\.1\.?\b", " ", text)
    text = re.sub(r"\bdona\b", "donna", text)
    text = re.sub(r"\bdelicius\b", "delicious", text)
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def aliases(name: str) -> str:
    key = norm(name)
    key = re.sub(r"\b1\b", " ", key)
    key = re.sub(r"\s+", " ", key).strip()
    if key in {"perfumeros", "perfumero", "perfumero de viaje"}:
        return "perfumero de viaje"
    if key in {"k toillete", "k toilette", "k toilette dolce gabbana"}:
        return "k toilette dolce gabbana"
    if "light blue" in key and "dolce" in key:
        return "light blue dolce gabbana hombre"
    if key in {"scandal absolud", "scandal absolu", "scandal absolu jean paul gaultier hombre"}:
        return "scandal absolu jean paul gaultier hombre"
    if key in {"en caja", "jean paul gaultier le beau parfum en caja"}:
        return "jean paul gaultier le beau parfum en caja"
    if key in {"en lata", "jean paul gaultier le beau parfum en lata"}:
        return "jean paul gaultier le beau parfum en lata"
    return key


def price_match(word: str):
    token = word.replace("💸", "")
    return PRICE_RE.match(token) or BARE_PRICE_RE.match(token)


def is_price(word: str) -> bool:
    return bool(price_match(word))


def product_images(page):
    page_area = page.rect.width * page.rect.height
    found = []
    for info in page.get_image_info(xrefs=True):
        bbox = info["bbox"]
        x0, y0, x1, y1 = bbox
        w, h = x1 - x0, y1 - y0
        if w < 145 or h < 145:
            continue
        if w * h > page_area * 0.42:
            continue
        if max(w, h) / max(min(w, h), 1) > 1.4:
            continue
        found.append({"bbox": bbox, "xref": info["xref"], "cx": (x0 + x1) / 2, "cy": (y0 + y1) / 2})
    return found


def products_on_page(page):
    words = []
    for x0, y0, x1, y1, text, *_ in page.get_text("words"):
        clean = text.strip()
        if not clean or clean in NOISE or "DISPONIBILIDAD" in clean:
            continue
        words.append({"x0": x0, "y0": y0, "x1": x1, "y1": y1, "text": clean, "cx": (x0 + x1) / 2, "cy": (y0 + y1) / 2})

    prices = []
    for word in words:
        match = price_match(word["text"])
        if not match:
            continue
        if any(abs(word["cx"] - item["cx"]) < 18 and abs(word["cy"] - item["cy"]) < 18 for item in prices):
            continue
        prices.append({**word, "price": int(match.group(1).replace(".", ""))})

    drafts = []
    for price in prices:
        nearby = []
        for word in words:
            if word is price or is_price(word["text"]):
                continue
            if ML_RE.match(word["text"]) or word["text"] in NOISE:
                continue
            if abs(word["cx"] - price["cx"]) > 115:
                continue
            if word["y0"] > price["y1"] + 6:
                continue
            if price["y0"] - word["y0"] > 82:
                continue
            nearby.append(word)
        nearby.sort(key=lambda word: (round(word["y0"], 0), word["x0"]))
        name = " ".join(word["text"] for word in nearby)
        name = re.sub(r"\s+", " ", name).strip(" -")
        if len(name) < 2:
            continue
        ml = None
        for word in words:
            ml_match = ML_RE.match(word["text"])
            if not ml_match:
                continue
            if abs(word["cx"] - price["cx"]) > 115:
                continue
            if abs(word["cy"] - price["cy"]) > 70:
                continue
            ml = int(ml_match.group(1)) or None
            break
        drafts.append(
            {
                "nombre": name,
                "talla_ml": ml,
                "precio": price["price"],
                "cx": price["cx"],
                "cy": price["cy"],
                "page": page.number,
            }
        )

    unique = []
    for draft in drafts:
        key = (aliases(draft["nombre"]), draft["talla_ml"])
        if any((aliases(item["nombre"]), item["talla_ml"]) == key for item in unique):
            continue
        unique.append(draft)

    images = product_images(page)
    pairs = []
    for index, draft in enumerate(unique):
        for image_index, image in enumerate(images):
            distance = ((image["cx"] - draft["cx"]) ** 2 + (image["cy"] - draft["cy"]) ** 2) ** 0.5
            if distance < 340:
                pairs.append((distance, index, image_index))
    pairs.sort()
    used_products = set()
    used_images = set()
    for _distance, index, image_index in pairs:
        if index in used_products or image_index in used_images:
            continue
        unique[index]["image"] = images[image_index]
        used_products.add(index)
        used_images.add(image_index)
    for draft in unique:
        draft.setdefault("image", None)
    leftovers = [index for index, draft in enumerate(unique) if draft["image"] is None]
    free_images = [index for index in range(len(images)) if index not in used_images]
    rescue = []
    for product_index in leftovers:
        draft = unique[product_index]
        for image_index in free_images:
            image = images[image_index]
            distance = ((image["cx"] - draft["cx"]) ** 2 + (image["cy"] - draft["cy"]) ** 2) ** 0.5
            if distance < 760:
                rescue.append((distance, product_index, image_index))
    rescue.sort()
    claimed_products = set()
    claimed_images = set()
    for _distance, product_index, image_index in rescue:
        if product_index in claimed_products or image_index in claimed_images:
            continue
        unique[product_index]["image"] = images[image_index]
        claimed_products.add(product_index)
        claimed_images.add(image_index)
    return unique


def save_image(doc, image_info, path: Path):
    info = doc.extract_image(image_info["xref"])
    image = Image.open(io.BytesIO(info["image"])).convert("RGBA")
    canvas = Image.new("RGB", image.size, (8, 8, 8))
    canvas.paste(image, mask=image.getchannel("A"))
    canvas.thumbnail((900, 900))
    path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(path, "JPEG", quality=86, optimize=True)


def best_match(item, pool):
    target = aliases(item["nombre"])
    target_words = target.split()
    best = None
    best_score = 0
    best_len = 10**6
    for product in pool:
        candidate = aliases(product["nombre"])
        candidate_words = candidate.split()
        if target == candidate:
            score = 1
        elif target_words and candidate_words[: len(target_words)] == target_words:
            score = 0.96 - (len(candidate_words) - len(target_words)) * 0.015
        elif candidate_words and target_words[: len(candidate_words)] == candidate_words:
            score = 0.96 - (len(target_words) - len(candidate_words)) * 0.015
        else:
            score = SequenceMatcher(None, target, candidate).ratio()
        if item["talla_ml"] and product["talla_ml"] and item["talla_ml"] != product["talla_ml"]:
            score -= 0.08
        shorter = len(candidate) < best_len
        if score > best_score or (abs(score - best_score) < 0.001 and shorter):
            best_score = score
            best = product
            best_len = len(candidate)
    if best and best_score >= 0.78:
        return best, best_score
    return None, best_score


def new_id(nombre, talla, index):
    return hashlib.sha1(f"caballero|{nombre}|{talla}|pdf|{index}".encode()).hexdigest()[:12]


def main():
    doc = pymupdf.open(PDF)
    parsed = []
    for page in doc:
        if page.number == 0:
            continue
        parsed.extend(products_on_page(page))

    if OUT_DIR.exists():
        for old in OUT_DIR.glob("*"):
            old.unlink()
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    products = json.loads(PRODUCTS.read_text(encoding="utf-8"))
    pool = [item for item in products if item["categoria"] == "caballero"]
    now = datetime.now(timezone.utc).isoformat()
    used_slugs = set()
    seen_aliases = set()
    report = []

    for index, item in enumerate(parsed, start=1):
        alias = aliases(item["nombre"])
        if alias in seen_aliases:
            continue
        product, score = best_match(item, pool)
        seen_aliases.add(alias)
        slug = aliases(item["nombre"]).replace(" ", "-")
        if item["talla_ml"]:
            slug += f"-{item['talla_ml']}"
        if slug in used_slugs:
            slug = f"{slug}-{index}"
        used_slugs.add(slug)
        image_url = ""
        if item["image"]:
            filename = f"{slug}.jpg"
            save_image(doc, item["image"], OUT_DIR / filename)
            image_url = f"/catalogo/caballero/{filename}"

        if product:
            pool.remove(product)
            product["precio"] = item["precio"]
            if item["talla_ml"]:
                product["talla_ml"] = item["talla_ml"]
            if image_url:
                product["imagen_url"] = image_url
            product["updated_at"] = now
            report.append((item, product["nombre"], round(score, 2), bool(image_url), product["precio"]))
        else:
            created = {
                "id": new_id(item["nombre"], item["talla_ml"], index),
                "nombre": item["nombre"].title(),
                "categoria": "caballero",
                "subcategoria": None,
                "talla_ml": item["talla_ml"],
                "precio": item["precio"],
                "precio_promocion": None,
                "notas": [],
                "imagen_url": image_url,
                "video_url": "",
                "disponible": True,
                "destacado": False,
                "created_at": now,
                "updated_at": now,
            }
            products.append(created)
            report.append((item, f"NUEVO {created['nombre']}", round(score, 2), bool(image_url), item["precio"]))

    PRODUCTS.write_text(json.dumps(products, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"parsed {len(parsed)} images {sum(1 for row in report if row[3])}")
    print("--- review ---")
    for item, name, score, has_image, price in report:
        flag = "" if has_image and score >= 0.9 else " !"
        print(f"p{item['page']:02d} {item['nombre']} {item['talla_ml'] or '-'} ${price} -> {name} ({score}){flag}")
    print("--- still without photo ---")
    for product in pool:
        print(product["nombre"], product["talla_ml"], product["precio"])


if __name__ == "__main__":
    main()
