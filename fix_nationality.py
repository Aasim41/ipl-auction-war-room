import pandas as pd

overseas_players = [
    # CSK
    "Devon Conway", "Rachin Ravindra", "Daryl Mitchell", "Moeen Ali", "Mitchell Santner", "Maheesh Theekshana", "Matheesha Pathirana", "Mustafizur Rahman", "Richard Gleeson",
    # MI
    "Tim David", "Romario Shepherd", "Mohammad Nabi", "Dewald Brevis", "Nuwan Thushara", "Luke Wood", "Kwena Maphaka", "Gerald Coetzee", "Jason Behrendorff", "Dilshan Madushanka",
    # RCB
    "Faf du Plessis", "Glenn Maxwell", "Will Jacks", "Cameron Green", "Reece Topley", "Tom Curran", "Lockie Ferguson", "Alzarri Joseph",
    # KKR
    "Phil Salt", "Philip Salt", "Sunil Narine", "Andre Russell", "Mitchell Starc", "Dushmantha Chameera", "Rahmanullah Gurbaz", "Sherfane Rutherford", "Allah Ghazanfar", "Jason Roy", "Gus Atkinson",
    # SRH
    "Pat Cummins", "Travis Head", "Heinrich Klaasen", "Aiden Markram", "Marco Jansen", "Glenn Phillips", "Fazalhaq Farooqi", "Wanindu Hasaranga",
    # DC
    "David Warner", "Mitchell Marsh", "Tristan Stubbs", "Jake Fraser-McGurk", "Anrich Nortje", "Jhye Richardson", "Shai Hope", "Gulbadin Naib", "Lungi Ngidi", "Harry Brook",
    # RR
    "Jos Buttler", "Trent Boult", "Shimron Hetmyer", "Rovman Powell", "Nandre Burger", "Tom Kohler-Cadmore", "Donovan Ferreira", "Keshav Maharaj", "Adam Zampa",
    # PBKS
    "Sam Curran", "Liam Livingstone", "Jonny Bairstow", "Kagiso Rabada", "Sikandar Raza", "Nathan Ellis", "Rilee Rossouw", "Chris Woakes",
    # GT
    "Rashid Khan", "David Miller", "Kane Williamson", "Spencer Johnson", "Azmatullah Omarzai", "Noor Ahmad", "Josh Little", "Matthew Wade", "Joshua Little",
    # LSG
    "Quinton de Kock", "Nicholas Pooran", "Marcus Stoinis", "Kyle Mayers", "Naveen-ul-Haq", "Shamar Joseph", "Ashton Turner", "Matt Henry", "David Willey", "Mark Wood"
]

def fix_nationality():
    df = pd.read_csv('data/filled_ipl_data.csv')
    
    # First, make everyone indian
    df['Nationality'] = 'indian'
    
    # Then explicitly mark overseas players
    matched = 0
    for ovs_player in overseas_players:
        # Exact match or fuzzy match
        mask = df['Player'].str.lower().str.replace(' ', '') == ovs_player.lower().replace(' ', '')
        if mask.any():
            df.loc[mask, 'Nationality'] = 'overseas'
            matched += 1
        else:
            # Try partial match for last names
            last_name = ovs_player.split()[-1].lower()
            mask = df['Player'].str.lower().str.contains(last_name)
            # Be careful with partial matches, only apply if we are reasonably sure
            if mask.sum() == 1:
                df.loc[mask, 'Nationality'] = 'overseas'
                matched += 1
            else:
                pass
                
    df.to_csv('data/filled_ipl_data.csv', index=False)
    print(f"Set Nationality to overseas for {matched} players.")
    
    indians = len(df[df['Nationality'] == 'indian'])
    ovs = len(df[df['Nationality'] == 'overseas'])
    print(f"Total: {len(df)} | Indian: {indians} | Overseas: {ovs}")

if __name__ == "__main__":
    fix_nationality()
