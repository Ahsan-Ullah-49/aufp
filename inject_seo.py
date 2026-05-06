import os
import glob

pages_dir = r"d:\Shop-Website\aufp\pages"
html_files = glob.glob(os.path.join(pages_dir, "*.html"))

inject_str = """
  <link rel="manifest" href="../manifest.json" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
"""

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "manifest.json" not in content and "</head>" in content:
        content = content.replace("</head>", f"{inject_str}</head>")
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file}")
