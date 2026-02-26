from PIL import Image
import os
import glob

def make_white_transparent(image_path):
    img = Image.open(image_path)
    img = img.convert("RGBA")
    data = img.getdata()

    new_data = []
    # threshold for considering a color white
    threshold = 240
    for item in data:
        if item[0] > threshold and item[1] > threshold and item[2] > threshold:
            # Change all white (also shades of whites)
            # pixels to transparent
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(image_path, "PNG")

directory = "assets/images/foods"
for filename in glob.glob(os.path.join(directory, "*.png")):
    print(f"Processing {filename}...")
    make_white_transparent(filename)
    
print("Done!")
