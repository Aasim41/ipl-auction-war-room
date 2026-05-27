import pandas as pd
import numpy as np

def fill_metadata():
    df = pd.read_csv('data/processed_ipl_data.csv')
    
    known_data = {
        'R Shepherd': ('Overseas', 'Pace', 'All-Rounder'),
        'V Suryavanshi': ('Indian', 'Spin', 'Middle Order'),
        'Urvil Patel': ('Indian', 'Spin', 'Middle Order'),
        'J Fraser-McGurk': ('Overseas', 'Pace', 'Top Order'),
        'A Mhatre': ('Indian', 'Pace', 'Top Order'),
        'N Pooran': ('Overseas', 'Spin', 'Middle Order'),
        'SA Yadav': ('Indian', 'Spin', 'Middle Order'),
        'H Klaasen': ('Overseas', 'Spin', 'Middle Order'),
        'Priyansh Arya': ('Indian', 'Pace', 'Top Order'),
        'T Stubbs': ('Overseas', 'Spin', 'Middle Order'),
        'JG Bethell': ('Overseas', 'Spin', 'All-Rounder'),
        'TM Head': ('Overseas', 'Spin', 'Top Order'),
        'PD Salt': ('Overseas', 'Pace', 'Top Order'),
        'Naman Dhir': ('Indian', 'Spin', 'All-Rounder'),
        'Abhishek Sharma': ('Indian', 'Spin', 'Top Order'),
        'Shashank Singh': ('Indian', 'Pace', 'Middle Order'),
        'SS Iyer': ('Indian', 'Spin', 'Middle Order'),
        'Vivrant Sharma': ('Indian', 'Spin', 'All-Rounder'),
        'Shubman Gill': ('Indian', 'Spin', 'Top Order'),
        'Ramandeep Singh': ('Indian', 'Pace', 'All-Rounder'),
        'M Shahrukh Khan': ('Indian', 'Spin', 'Middle Order'),
        'YBK Jaiswal': ('Indian', 'Spin', 'Top Order'),
        'KK Nair': ('Indian', 'Spin', 'Middle Order'),
        'V Kohli': ('Indian', 'Pace', 'Top Order'),
        'JM Bairstow': ('Overseas', 'Pace', 'Top Order'),
        'B Sai Sudharsan': ('Indian', 'Spin', 'Top Order'),
        'C Bosch': ('Overseas', 'Pace', 'All-Rounder'),
        'TH David': ('Overseas', 'Spin', 'Middle Order'),
        'JP Inglis': ('Overseas', 'Pace', 'Middle Order'),
        'D Brevis': ('Overseas', 'Spin', 'Middle Order'),
        'C Green': ('Overseas', 'Pace', 'All-Rounder'),
        'Ashutosh Sharma': ('Indian', 'Pace', 'Middle Order'),
        'SB Dubey': ('Indian', 'Pace', 'Middle Order'),
        'MS Dhoni': ('Indian', 'Pace', 'Middle Order'),
        'F du Plessis': ('Overseas', 'Spin', 'Top Order'),
        'RR Rossouw': ('Overseas', 'Spin', 'Top Order'),
        'SP Narine': ('Overseas', 'Spin', 'All-Rounder'),
        'P Simran Singh': ('Indian', 'Pace', 'Top Order'),
        'Rashid Khan': ('Overseas', 'Spin', 'All-Rounder'),
        'RA Jadeja': ('Indian', 'Spin', 'All-Rounder'),
        'AD Russell': ('Overseas', 'Pace', 'All-Rounder'),
        'AR Patel': ('Indian', 'Spin', 'All-Rounder'),
        'HH Pandya': ('Indian', 'Pace', 'All-Rounder'),
        'MR Marsh': ('Overseas', 'Pace', 'All-Rounder'),
        'SE Rutherford': ('Overseas', 'Pace', 'Middle Order'),
        'Mohammed Siraj': ('Indian', 'Pace', 'Bowler'),
        'JJ Bumrah': ('Indian', 'Pace', 'Bowler'),
        'K Rabada': ('Overseas', 'Pace', 'Bowler'),
        'TA Boult': ('Overseas', 'Pace', 'Bowler'),
        'YS Chahal': ('Indian', 'Spin', 'Bowler'),
        'R Ashwin': ('Indian', 'Spin', 'Bowler'),
        'Kuldeep Yadav': ('Indian', 'Spin', 'Bowler'),
        'Avesh Khan': ('Indian', 'Pace', 'Bowler'),
        'Arshdeep Singh': ('Indian', 'Pace', 'Bowler'),
        'Harshal Patel': ('Indian', 'Pace', 'Bowler'),
        'M Pathirana': ('Overseas', 'Pace', 'Bowler'),
        'PJ Cummins': ('Overseas', 'Pace', 'Bowler'),
        'MA Starc': ('Overseas', 'Pace', 'Bowler'),
        'CJ Jordan': ('Overseas', 'Pace', 'Bowler'),
        'SM Curran': ('Overseas', 'Pace', 'All-Rounder'),
        'MP Stoinis': ('Overseas', 'Pace', 'All-Rounder'),
        'GJ Maxwell': ('Overseas', 'Spin', 'All-Rounder'),
        'Rachin Ravindra': ('Overseas', 'Spin', 'All-Rounder'),
        'Mustafizur Rahman': ('Overseas', 'Pace', 'Bowler'),
        'Naveen-ul-Haq': ('Overseas', 'Pace', 'Bowler'),
        'Noor Ahmad': ('Overseas', 'Spin', 'Bowler'),
        'RD Gaikwad': ('Indian', 'Spin', 'Top Order'),
        'KL Rahul': ('Indian', 'Spin', 'Top Order'),
        'RG Sharma': ('Indian', 'Spin', 'Top Order'),
        'S Dhawan': ('Indian', 'Spin', 'Top Order'),
        'Ishan Kishan': ('Indian', 'Spin', 'Top Order'),
        'SV Samson': ('Indian', 'Spin', 'Middle Order'),
        'RK Singh': ('Indian', 'Spin', 'Middle Order'),
        'Shivam Dube': ('Indian', 'Pace', 'Middle Order'),
        'Sandeep Sharma': ('Indian', 'Pace', 'Bowler'),
        'B Kumar': ('Indian', 'Pace', 'Bowler'),
        'MM Sharma': ('Indian', 'Pace', 'Bowler'),
        'T Natarajan': ('Indian', 'Pace', 'Bowler'),
        'Varun Chakaravarthy': ('Indian', 'Spin', 'Bowler'),
        'Ravi Bishnoi': ('Indian', 'Spin', 'Bowler'),
        'Washington Sundar': ('Indian', 'Spin', 'All-Rounder'),
        'Krunal Pandya': ('Indian', 'Spin', 'All-Rounder'),
        'AM Rahane': ('Indian', 'Spin', 'Top Order'),
        'MK Pandey': ('Indian', 'Spin', 'Middle Order'),
        'WP Saha': ('Indian', 'Spin', 'Top Order'),
        'DK Karthik': ('Indian', 'Spin', 'Middle Order'),
        'Moeen Ali': ('Overseas', 'Spin', 'All-Rounder'),
        'J Archer': ('Overseas', 'Pace', 'Bowler'),
        'JC Buttler': ('Overseas', 'Spin', 'Top Order')
    }

    def guess_nationality(name):
        overseas_names = ['Smith', 'Warner', 'Marsh', 'Head', 'Cummins', 'Starc', 'Hazlewood', 'Zampa', 'Maxwell', 'Stoinis', 'Finch', 'Wade', 'Inglis', 'David', 'Green', 'Ellis', 'Behrendorff', 'Richardson', 'Abbott', 'Carey', 'Marnus', 'Tye', 'Lynn', 'Christian', 'Meredith', 'Sams', 'Short', 'Dwarshuis', 'Philippe', 'Hardie', 'Sangha', 'Johnson', 'Boult', 'Williamson', 'Santner', 'Conway', 'Phillips', 'Allen', 'Southee', 'Ferguson', 'Henry', 'Milne', 'Jamieson', 'Neesham', 'Mitchell', 'Ravindra', 'Chapman', 'Seifert', 'Klaasen', 'De Kock', 'Miller', 'Rabada', 'Nortje', 'Ngidi', 'Jansen', 'Markram', 'Van der Dussen', 'Bavuma', 'Stubbs', 'Brevis', 'Rossouw', 'Maharaj', 'Shamsi', 'Burger', 'Coetzee', 'Pretorius', 'Parnell', 'Buttler', 'Bairstow', 'Salt', 'Stokes', 'Curran', 'Ali', 'Livingstone', 'Brook', 'Malan', 'Roy', 'Hales', 'Archer', 'Wood', 'Topley', 'Rashid', 'Jordan', 'Mills', 'Gleeson', 'Willey', 'Dawson', 'Bethell', 'Pooran', 'Russell', 'Narine', 'Hetmyer', 'Powell', 'Mayers', 'Holder', 'Joseph', 'Hosein', 'Shepherd', 'Rutherford', 'McCoy', 'Cottrell', 'Bravo', 'Pollard', 'Gayle', 'Rashid Khan', 'Nabi', 'Mujeeb', 'Gurbaz', 'Zadran', 'Omarzai', 'Naveen', 'Fazalhaq', 'Noor', 'Qais', 'Pathirana', 'Theekshana', 'Hasaranga', 'Chameera', 'Madushanka', 'Thushara', 'Shanaka', 'Rajapaksa', 'Asalanka', 'Mendis', 'Shakib', 'Mustafizur', 'Litton', 'Taskin']
        name_parts = name.split()
        for part in name_parts:
            if part in overseas_names:
                return 'Overseas'
        if any(char in name for char in ['-', "'"]):
            return 'Overseas'
        return 'Indian'

    df['Nationality'] = df['Nationality'].astype(str)
    df['Bowling_Style'] = df['Bowling_Style'].astype(str)
    df['Specific_Role'] = df['Specific_Role'].astype(str)

    for index, row in df.iterrows():
        player = row['Player']
        # If user already filled, skip
        if pd.notna(row['Nationality']) and row['Nationality'] != 'nan' and row['Nationality'] != '':
            continue
            
        if player in known_data:
            nat, style, role = known_data[player]
            df.at[index, 'Nationality'] = nat
            df.at[index, 'Bowling_Style'] = style
            df.at[index, 'Specific_Role'] = role
        else:
            df.at[index, 'Nationality'] = guess_nationality(player)
            
            # Guess Style based on name or just default Pace
            if 'spin' in player.lower() or 'chahar' in player.lower():
                df.at[index, 'Bowling_Style'] = 'Spin'
            else:
                df.at[index, 'Bowling_Style'] = 'Pace'
                
            # Guess Specific_Role based on calculated 'Role'
            if row['Role'] == 'Batter':
                # Assume top order for high avg, else middle
                if row['Batting_Avg'] > 30:
                    df.at[index, 'Specific_Role'] = 'Top Order'
                else:
                    df.at[index, 'Specific_Role'] = 'Middle Order'
            elif row['Role'] == 'Bowler':
                df.at[index, 'Specific_Role'] = 'Bowler'
            else:
                df.at[index, 'Specific_Role'] = 'All-Rounder'

    df.to_csv('data/filled_ipl_data.csv', index=False)
    print("Metadata successfully auto-filled for all players!")

if __name__ == "__main__":
    fill_metadata()
