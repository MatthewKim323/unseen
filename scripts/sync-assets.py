#!/usr/bin/env python3
"""Mirror harvested runtime assets into public/.
theme resources -> public/theme/<same relative path>
uploaded media  -> public/media/<sha1[:12]>.<ext>, map in reference/site/media-map.json (origin paths stay out of the app)
Re-runnable."""
import hashlib, json, os, shutil
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
net = os.path.join(root, 'reference/site/runtime/net')
pub = os.path.join(root, 'public')
media_map = {}
for dp, _, fs in os.walk(net):
    for f in fs:
        src = os.path.join(dp, f)
        rel = os.path.relpath(src, net)
        if '/resources/assets/' in '/' + rel:
            dst = os.path.join(pub, 'theme', rel.split('resources/assets/', 1)[1])
        elif rel.startswith('wp-content/uploads/'):
            h = hashlib.sha1(open(src, 'rb').read()).hexdigest()[:12]
            ext = os.path.splitext(f)[1].lower()
            name = f'{h}{ext}'
            dst = os.path.join(pub, 'media', name)
            media_map['/' + rel] = '/media/' + name
        else:
            continue
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if not os.path.exists(dst) or os.path.getsize(dst) != os.path.getsize(src):
            shutil.copy2(src, dst)

json.dump(dict(sorted(media_map.items())), open(os.path.join(root, 'reference/site/media-map.json'), 'w'), indent=1)
print('theme files:', sum(len(f) for _, _, f in os.walk(os.path.join(pub, 'theme'))), 'media:', len(media_map))
