import fitz
import os
import json

doc = fitz.open("Adele-Taccone_portfolio-apr2025.pdf")
os.makedirs("assets", exist_ok=True)

page_images = {}

for page_num in range(len(doc)):
    page = doc[page_num]
    image_list = page.get_images(full=True)
    images_extracted = []
    
    for img_index, img in enumerate(image_list, start=1):
        xref = img[0]
        base_image = doc.extract_image(xref)
        image_bytes = base_image["image"]
        image_ext = base_image["ext"]
        
        # skip very small images (like icons or small UI elements)
        if len(image_bytes) < 15000:
            continue
            
        img_name = f"page_{page_num+1}_{img_index}.{image_ext}"
        img_path = os.path.join("assets", img_name)
        
        with open(img_path, "wb") as f:
            f.write(image_bytes)
            
        images_extracted.append(f"assets/{img_name}")
        
    if images_extracted:
        page_images[page_num + 1] = images_extracted
        print(f"Page {page_num + 1}: Extracted {len(images_extracted)} images")

with open('page_images.json', 'w') as f:
    json.dump(page_images, f, indent=2)
