import json

# Exact page mapping per project
mapping = {
    1: [5],
    2: [6],
    3: [7],
    4: [8],
    5: [9, 10],
    6: [11, 12, 13],
    7: [14, 15, 16, 17],
    8: [19, 20],
    9: [21],
    10: [22],
    11: [23],
    12: [24, 25, 26],
    13: [27, 28, 29],
    14: [31, 32, 33],
    15: [34, 35, 36, 37, 38, 39, 40]
}

with open('page_images.json', 'r') as f:
    page_images = json.load(f)

with open('projects.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for proj in data['projects']:
    proj_id = int(proj['id'])
    pages = mapping.get(proj_id, [])
    
    imgs = []
    for p in pages:
        if str(p) in page_images:
            imgs.extend(page_images[str(p)])
            
    # Max 6 images per project to keep it clean
    proj['images'] = imgs[:6]

with open('projects.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Mapping completato con successo!")
