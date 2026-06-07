with open('app.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Mock Auction string replacement
old_mock = """with tab4:

    st.title("💰 Mock Auction Simulator")

    st.write("Test your drafting strategies against aggressive AI franchises. Outbid them to build your ultimate 25-man roster within your ₹ 100 Cr budget!")

    

    # Dashboard metrics"""

new_mock = """with tab4:

    st.title("💰 Mock Auction Simulator")

    st.write("Test your drafting strategies against aggressive AI franchises. Outbid them to build your ultimate 25-man roster within your ₹ 100 Cr budget!")

    if st.session_state.auction_pool.empty:
        st.warning("⚠️ You must complete the Retention Phase in the War Room to generate the Auction Pool first!")
    else:
        # Dashboard metrics"""

content = content.replace(old_mock, new_mock)

# Indent everything under Mock auction up to tab5
parts = content.split("        # Dashboard metrics")
if len(parts) == 2:
    before = parts[0]
    after = parts[1]
    
    mock_after, tab5_after = after.split("with tab5:")
    
    indented_mock = ""
    for line in mock_after.split('\n'):
        if line.strip():
            indented_mock += "    " + line + "\n"
        else:
            indented_mock += "\n"
            
    content = before + "        # Dashboard metrics" + indented_mock + "with tab5:" + tab5_after

with open('app.py', 'w', encoding='utf-8') as f:
    f.write(content)
