import urllib.request
import json

url = 'https://api.github.com/repos/Aasim41/ipl-auction-war-room/actions/runs?per_page=3'
req = urllib.request.Request(url, headers={'User-Agent': 'Python'})
try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        print('Total runs:', data.get('total_count'))
        for r in data.get('workflow_runs', []):
            commit_id = r.get('head_commit', {}).get('id', '')[:7]
            msg = r.get('head_commit', {}).get('message', '')[:40].replace('\n', ' ')
            print(f"Run #{r['id']}: Status: {r['status']}, Conclusion: {r['conclusion']}, Commit: {commit_id} ({msg})")
            print(f"URL: {r['html_url']}")
except Exception as e:
    print('Error:', e)
