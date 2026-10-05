import pandas as pd

def fix_overseas():
    df = pd.read_csv('data/filled_ipl_data.csv')
    
    missed_overseas = [
        'C Bosch', 'TH David', 'JP Inglis', 'DP Conway', 'GJ Maxwell', 
        'AK Markram', 'PHKD Mendis', 'MG Bracewell', 'HC Brook', 'MM Ali', 
        'MW Short', 'JC Archer', 'PBB Rajapaksa', 'PWH de Silva', 'MA Wood', 
        'E Malinga', 'JR Hazlewood', "W O'Rourke", 'TA Boult', 'RP Meredith', 
        'WD Parnell', 'KA Jamieson', 'AS Joseph', 'RJW Topley', 'JO Holder', 
        'XC Bartlett', 'V Viyaskanth', 'CJ Jordan', 'MJ Henry', 'Matthew Breetzke', 
        'Lizaad Williams', 'Jacob Bethell', 'Brydon Carse', 'Aaron Hardie', 
        'Kamindu Mendis', 'Jamie Overton', 'Karim Janat', 'Bevon Jacobs', 
        'Jofra Archer', 'Dasun Shanaka', 'Kusal Mendis', 'Mujeeb Ur Rahman', 
        'Wiaan Mulder', 'Pathum Nissanka', 'Ben Duckett', 'George Linde', 
        'Jacob Duffy', 'David Payne', 'Finn Allen', 'Blessing Muzarabani', 
        'Tim Seifert', 'Tom Banton', 'Cooper Connolly', 'Ben Dwarshuis', 
        'Zakary Foulkes', 'Akeal Hosein', 'Lhuan-dre Pretorius', 'Adam Milne',
        'JG Bethell', 'PD Salt', 'JJ Roy', 'WG Jacks', 'RD Rickelton'
    ]
    
    fixed = 0
    for idx, row in df.iterrows():
        p_name = row['Player'].strip()
        if p_name in missed_overseas or any(p_name.endswith(m.split()[-1]) and len(m.split()[-1]) > 3 for m in missed_overseas):
            if df.at[idx, 'Nationality'] != 'overseas':
                df.at[idx, 'Nationality'] = 'overseas'
                fixed += 1
                
    df.to_csv('data/filled_ipl_data.csv', index=False)
    print(f"Fixed {fixed} missing overseas players.")

if __name__ == '__main__':
    fix_overseas()
