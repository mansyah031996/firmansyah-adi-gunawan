import urllib.request, os

sheets = [
    (0, "1795321936", "COUNTDOWN ALL UNIT"),
    (1, "1940937859", "URUTAN UNIT DELIVERY"),
    (2, "2077481871", "TARGET PROJECT JULI"),
    (3, "1109052022", "TARGET PROJECT AGUSTUS"),
    (4, "1662570265", "ACTUAL JOBDESC JULI"),
    (5, "994090173", "ACTUAL JOBDESC AGUSTUS"),
    (6, "111152824", "DAFTAR UNIT"),
    (7, "2102617088", "_HASIL KERJA JULI"),
    (8, "1704737199", "TARGET PROJECT JUNI"),
    (9, "949361229", "DATABASE UNIT SM"),
    (10, "1768672018", "HASIL KERJA 2023-2026"),
    (11, "622501492", "SPK"),
    (12, "1679857860", "HASIL KERJA AGUSTUS"),
    (13, "131205278", "SPL"),
    (14, "1780918669", "HASIL KERJA JULI"),
    (16, "2129035036", "HASIL KERJA JUNI"),
    (17, "1601396897", "CARI SPAREPART"),
    (18, "519690305", "AUDIT PROGRES JAM KERJA (ALL DIVISI)"),
    (19, "1902599640", "HASIL KERJA MEI"),
    (20, "88963952", "JAM KERJA (MEI)"),
    (21, "1292075028", "REKAP LEMBUR"),
    (22, "1718947165", "PEMBAHASAN"),
    (23, "15419753", "HASIL KERJA APRIL"),
    (24, "277304006", "TIMELINE"),
    (25, "1944328788", "SPF ALL UNIT"),
    (26, "0", "JAM KERJA (APRIL)"),
    (27, "1037877677", "REKOMENDASI")
]

doc_id = '1HfwktSkX2QNtKPGOVNdPK-3PTN1lSj3Rl3KlItbizp0'

os.makedirs('csv_sheets', exist_ok=True)

for idx, gid, name in sheets:
    clean_name = name.replace(' ', '_').replace('/', '_').replace('&', 'AND')
    filename = f"csv_sheets/{idx:02d}_{clean_name}_{gid}.csv"
    url = f"https://docs.google.com/spreadsheets/d/{doc_id}/export?format=csv&gid={gid}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        content = urllib.request.urlopen(req).read().decode('utf-8')
        with open(filename, 'w') as f:
            f.write(content)
        lines = [l for l in content.splitlines() if l.strip(', ')]
        print(f"[{idx:02d}] Saved {filename} ({len(lines)} non-empty lines)")
    except Exception as e:
        print(f"[{idx:02d}] ERROR {name} (GID {gid}): {e}")
