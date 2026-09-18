import urllib.request
import urllib.parse
import csv
import json
import os
import concurrent.futures
import time

MULTI_YEAR_SHEETS = {
    '2023': {
        'id': '1YDRqJ-xJ3wTECsxh2pkOykvzNy70TPuw3j8qxTFacu4',
        'months': [
            'JANUARI 2023', 'FEBRUARI 2023', 'MARET 2023', 'APRIL 2023',
            'MEI 2023', 'JUNI 2023', 'JULI 2023', 'AGUSTUS 2023',
            'SEPTEMBER 2023', 'OKTOBER 2023', 'NOVEMBER 2023', 'DESEMBER 2023'
        ]
    },
    '2024': {
        'id': '158MGWDu4vvjOwv_WkqUiXj4cDTHlaD0tPaEG2bAuuTA',
        'months': [
            'JANUARI 2024', 'FEBRUARI 2024', 'MARET 2024', 'APRIL 2024',
            'MEI 2024', 'JUNI 2024', 'JULI 2024', 'AGUSTUS 2024',
            'SEPTEMBER 2024', 'OKTOBER 2024', 'NOVEMBER 2024', 'DESEMBER 2024'
        ]
    },
    '2025': {
        'id': '1JO8bCdVw2MiDJqeBDG9LNX2IiR_wev3DSzqnVdTHj8g',
        'months': [
            'JANUARI 2025', 'FEBRUARI 2025', 'MARET 2025', 'APRIL 2025',
            'MEI 2025', 'JUNI 2025', 'JULI 2025', 'AGUSTUS 2025',
            'SEPTEMBER 2025', 'OKTOBER 2025', 'NOVEMBER 2025', 'DESEMBER 2025'
        ]
    },
    '2026': {
        'id': '1s2OyAqvgvw64yhz0RW0QXGThcpv1vJo9JcKbxIlkfyk',
        'months': [
            'JANUARI 2026', 'FEBRUARI 2026', 'MARET 2026', 'APRIL 2026',
            'MEI 2026', 'JUNI 2026', 'JULI 2026', 'AGUSTUS 2026', 'SEPTEMBER 2026'
        ]
    }
}

os.makedirs('csv_all_years', exist_ok=True)

def fetch_sheet_csv(year, sheet_id, month_tab):
    filename = f"csv_all_years/{year}_{month_tab.replace(' ', '_')}.csv"
    if os.path.exists(filename) and os.path.getsize(filename) > 500:
        with open(filename, 'r', encoding='utf-8', errors='ignore') as f:
            return year, month_tab, f.read()

    url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/gviz/tq?tqx=out:csv&sheet={urllib.parse.quote(month_tab)}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                content = resp.read().decode('utf-8', errors='ignore')
                if len(content) > 100:
                    with open(filename, 'w', encoding='utf-8') as f:
                        f.write(content)
                    return year, month_tab, content
        except Exception as e:
            time.sleep(1)
    return year, month_tab, ""

tasks = []
for yr, cfg in MULTI_YEAR_SHEETS.items():
    for m in cfg['months']:
        tasks.append((yr, cfg['id'], m))

print(f"Total tabs to fetch: {len(tasks)}")

results = []
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
    future_to_tab = {
        executor.submit(fetch_sheet_csv, yr, sid, m): (yr, m)
        for yr, sid, m in tasks
    }
    for future in concurrent.futures.as_completed(future_to_tab):
        yr, m = future_to_tab[future]
        try:
            res_yr, res_m, csv_text = future.result()
            lines_cnt = len(csv_text.splitlines()) if csv_text else 0
            print(f"[{res_yr}] {res_m}: {lines_cnt} lines")
            results.append((res_yr, res_m, csv_text))
        except Exception as e:
            print(f"FAILED {yr} {m}: {e}")

print("All downloads completed! Parsing into records...")

all_records = []
rec_id_counter = 1

# Process in chronological order: 2023 -> 2024 -> 2025 -> 2026
month_order = [
    'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
    'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
]

def get_sort_key(item):
    yr, m, _ = item
    m_base = m.split()[0]
    m_idx = month_order.index(m_base) if m_base in month_order else 99
    return (int(yr), m_idx)

results.sort(key=get_sort_key)

for yr, month_tab, csv_text in results:
    if not csv_text or len(csv_text) < 50:
        continue
    
    # Read CSV
    reader = csv.reader(csv_text.splitlines())
    rows = list(reader)
    if not rows:
        continue
    
    # Identify header row
    header_idx = -1
    for i in range(min(5, len(rows))):
        row_str = " ".join(rows[i]).upper()
        if "TANGGAL" in row_str and ("UNIT" in row_str or "DIVISI" in row_str):
            header_idx = i
            break
            
    start_row = header_idx + 1 if header_idx >= 0 else 1
    
    # Parse data rows
    last_valid_tanggal = ""
    for r in rows[start_row:]:
        if not r or not any(r):
            continue
        
        # Must have at least 5 cols
        if len(r) < 5:
            continue
            
        tanggal = r[0].strip() if len(r) > 0 else ""
        if tanggal:
            last_valid_tanggal = tanggal
        else:
            tanggal = last_valid_tanggal
            
        divisi = r[1].strip() if len(r) > 1 else ""
        unit = r[2].strip() if len(r) > 2 else ""
        nama = r[3].strip() if len(r) > 3 else ""
        panel = r[4].strip() if len(r) > 4 else ""
        jobdesc = r[5].strip() if len(r) > 5 else ""
        keterangan = r[6].strip() if len(r) > 6 else ""
        start_time = r[7].strip() if len(r) > 7 else "8:00"
        estimasi = r[8].strip() if len(r) > 8 else "17:00"
        break_time = r[9].strip() if len(r) > 9 else "1:00"
        finish_time = r[10].strip() if len(r) > 10 else "17:00"
        status = r[11].strip() if len(r) > 11 else "Done"
        total_jam = r[12].strip() if len(r) > 12 else ""
        
        # Skip header duplicates or summary rows
        if "TANGGAL" in tanggal.upper() or "JUMLAH" in unit.upper() or "TOTAL" in unit.upper():
            continue
        if not unit and not nama and not panel and not jobdesc:
            continue
            
        # Normalize status
        if not status or status == "-":
            status = "Done"
            
        # Clean total jam
        if not total_jam or total_jam == "-":
            total_jam = "8:00" if "DONE" in status.upper() else "4:00"
            
        all_records.append({
            "id": f"hk_{rec_id_counter}",
            "tanggal": tanggal,
            "tahun": yr,
            "divisi": divisi or "ALL DIVISI",
            "unit": unit or "ALL UNIT",
            "nama": nama or "TEKNISI",
            "panelPart": panel or "-",
            "jobdesc": jobdesc or "-",
            "keterangan": keterangan,
            "start": start_time,
            "estimasi": estimasi,
            "breakTime": break_time,
            "finish": finish_time,
            "status": status,
            "totalJamKerja": total_jam
        })
        rec_id_counter += 1

print(f"Total aggregated records: {len(all_records)}")

# Year breakdown
summary = {}
for r in all_records:
    yr = r['tahun']
    summary[yr] = summary.get(yr, 0) + 1
print("Records by year:", summary)

# Write to public/data/hasilKerja2023_2026Records.json
os.makedirs('public/data', exist_ok=True)
with open('public/data/hasilKerja2023_2026Records.json', 'w', encoding='utf-8') as f:
    json.dump(all_records, f)
print("Saved to public/data/hasilKerja2023_2026Records.json")

# Write sample to src/data/hasilKerja2023_2026RecordsSample.json (first 500 + last 500)
sample = all_records[:500] + all_records[-500:]
with open('src/data/hasilKerja2023_2026RecordsSample.json', 'w', encoding='utf-8') as f:
    json.dump(sample, f)
print(f"Saved sample ({len(sample)}) to src/data/hasilKerja2023_2026RecordsSample.json")
