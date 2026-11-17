import urllib.request
import json
import sys

def main():
    req = urllib.request.Request('https://api.github.com/repos/Aasim41/ipl-auction-war-room/actions/runs/44084290209/jobs', headers={'User-Agent': 'python'})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            for j in data.get('jobs', []):
                print(f"Job: {j.get('name')}, Status: {j.get('status')}, Conclusion: {j.get('conclusion')}")
                for s in j.get('steps', []):
                    print(f"  Step: {s.get('name')} - {s.get('status')} ({s.get('conclusion')})")
    except Exception as e:
        print('Error:', e)

if __name__ == '__main__':
    main()
