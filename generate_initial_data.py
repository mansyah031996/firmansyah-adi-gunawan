import csv, json

def parse_time(val):
    if not val: return '0:00'
    val = val.strip().strip('\"')
    if not val or val == '-': return '0:00'
    return val

# 1. Parse URUTAN UNIT DELIVERY
with open('csv_sheets/01_URUTAN_UNIT_DELIVERY_1940937859.csv', 'r') as f:
    lines = [l.strip() for l in f if l.strip()]

units = []
current_pm = ''
current_margin = ''

sheet_no = 1
for line in lines:
    parts = [p.strip('\"').strip() for p in line.split(',')]
    if 'UNIT MARGIN' in line and not 'UNIT NON MARGIN' in line:
        current_margin = 'UNIT MARGIN'
    elif 'UNIT NON MARGIN' in line:
        current_margin = 'UNIT NON MARGIN'
    
    if len(parts) >= 12 and parts[0] in ['IQBAL N', 'FIKI']:
        pm = parts[0]
        unit = parts[1]
        unit_in = parts[2]
        cat = parts[3]
        lead = parts[4]
        mech = parse_time(parts[5])
        bw = parse_time(parts[6])
        bp = parse_time(parts[7])
        interior = parse_time(parts[8])
        chrome = parse_time(parts[9])
        bubut = parse_time(parts[10])
        total = parse_time(parts[11])
        priority = parts[13] if len(parts) > 13 else ''
        status = parts[14] if len(parts) > 14 else ''
        delivery = parts[15] if len(parts) > 15 else ''
        
        # Determine highlightType
        highlight = 'normal'
        if 'DONE' in status.upper():
            highlight = 'green'
        elif 'HOLD' in status.upper() or 'SLOW' in status.upper():
            highlight = 'yellow'
        elif 'URGENT' in status.upper():
            highlight = 'red'
            
        units.append({
            'sheetNo': sheet_no,
            'pm': pm,
            'margin': current_margin,
            'unit': unit,
            'in': unit_in,
            'cat': cat if cat in ['FULL RESTORE', 'PARSIAL'] else 'FULL RESTORE',
            'lead': lead,
            'divs': {
                'mechanic': mech,
                'bodyWork': bw,
                'bodyPaint': bp,
                'interior': interior,
                'chrome': chrome,
                'bubut': bubut,
                'total': total
            },
            'priority': priority if priority else '-',
            'status': status if status else 'OP MEDIUM PROGRES',
            'delivery': delivery,
            'highlight': highlight
        })
        sheet_no += 1

# 2. Parse TARGET PROJECT JULI for July hours mapping
with open('csv_sheets/02_TARGET_PROJECT_JULI_2077481871.csv', 'r') as f:
    juli_lines = [l.strip() for l in f if l.strip()]

juli_map = {}
for line in juli_lines:
    parts = [p.strip('\"').strip() for p in line.split(',')]
    if len(parts) >= 18 and parts[1]: # parts[1] is unit name
        uname = parts[1]
        try:
            mech_t, mech_a = parse_time(parts[2]), parse_time(parts[3])
            bw_t, bw_a = parse_time(parts[4]), parse_time(parts[5])
            bp_t, bp_a = parse_time(parts[6]), parse_time(parts[7])
            int_t, int_a = parse_time(parts[8]), parse_time(parts[9])
            chr_t, chr_a = parse_time(parts[10]), parse_time(parts[11])
            bub_t, bub_a = parse_time(parts[12]), parse_time(parts[13])
            qa_t, qa_a = parse_time(parts[14]), parse_time(parts[15])
            all_t, all_a = parse_time(parts[16]), parse_time(parts[17])
            tot_t = parse_time(parts[18]) if len(parts) > 18 else '0:00'
            tot_a = parse_time(parts[19]) if len(parts) > 19 else '0:00'
            
            juli_map[uname] = {
                'tot_t': tot_t,
                'tot_a': tot_a,
                'divs': {
                    'mechanic': mech_a,
                    'bodyWork': bw_a,
                    'bodyPaint': bp_a,
                    'interior': int_a,
                    'chrome': chr_a,
                    'bubut': bub_a,
                    'qa': qa_a,
                    'allDivisi': all_a
                }
            }
        except Exception:
            pass

ts_code = "import { ProjectUnit } from '../types';\n\nexport const INITIAL_PROJECT_UNITS: ProjectUnit[] = [\n"

for idx, u in enumerate(units, 1):
    j_info = juli_map.get(u['unit'], {
        'tot_t': '0:00',
        'tot_a': '0:00',
        'divs': {
            'mechanic': '0:00', 'bodyWork': '0:00', 'bodyPaint': '0:00',
            'interior': '0:00', 'chrome': '0:00', 'bubut': '0:00',
            'qa': '0:00', 'allDivisi': '0:00'
        }
    })
    
    uid = f"unit-{idx:02d}"
    delivery_str = f"    targetDeliveryDate: '{u['delivery']}',\n" if u['delivery'] else ""
    
    ts_code += f"""  {{
    id: '{uid}',
    sheetNo: {u['sheetNo']},
    projectManager: '{u['pm']}',
    marginType: '{u['margin']}',
    unitName: '{u['unit']}',
    unitInDate: '{u['in']}',
    progressCategory: '{u['cat']}',
    teamLead: '{u['lead']}',
    priorityOrder: '{u['priority']}',
    status: '{u['status']}',
{delivery_str}    juliTargetHours: '{j_info['tot_t']}',
    juliActualHours: '{j_info['tot_a']}',
    juliDivisions: {{ mechanic: '{j_info['divs']['mechanic']}', bodyWork: '{j_info['divs']['bodyWork']}', bodyPaint: '{j_info['divs']['bodyPaint']}', interior: '{j_info['divs']['interior']}', chrome: '{j_info['divs']['chrome']}', bubut: '{j_info['divs']['bubut']}', qa: '{j_info['divs']['qa']}', allDivisi: '{j_info['divs']['allDivisi']}' }},
    divisionHours: {{ mechanic: '{u['divs']['mechanic']}', bodyWork: '{u['divs']['bodyWork']}', bodyPaint: '{u['divs']['bodyPaint']}', interior: '{u['divs']['interior']}', chrome: '{u['divs']['chrome']}', bubut: '{u['divs']['bubut']}', total: '{u['divs']['total']}' }},
    highlightType: '{u['highlight']}',
  }},\n"""

ts_code += "];\n"

with open('src/data/initialData.ts', 'w') as f:
    f.write(ts_code)

print('Generated src/data/initialData.ts successfully!')
