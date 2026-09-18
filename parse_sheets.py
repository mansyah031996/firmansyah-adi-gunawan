import re

with open('sheet_page.html', 'r') as f:
    html = f.read()

pattern = r'\[21350203,"\[(\d+),(\d+),\\"(\d+)\\",\[\{\\"1\\":\[\[0,0,\\"([^\\"]+)\\"'
matches = re.findall(pattern, html)

print(f'Total sheets found: {len(matches)}')
print('-'*70)
sheet_list = []
for idx, hidden, gid, name in matches:
    sheet_list.append((int(idx), int(hidden), gid, name))

sheet_list.sort(key=lambda x: x[0])
for idx, hidden, gid, name in sheet_list:
    status = 'HIDDEN' if hidden == 1 else 'VISIBLE'
    print(f'Index {idx:>2} | {status:<7} | GID: {gid:>11} | Name: {name}')
