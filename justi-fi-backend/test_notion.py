# import os
# import requests
# import json

# NOTION_KEY = "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"
# headers = {
#     "Authorization": f"Bearer {NOTION_KEY}",
#     "Content-Type": "application/json",
#     "Notion-Version": "2022-06-28",
# }

# search_params = {"filter": {"value": "page", "property": "object"}}
# search_response = requests.post(
#     f"https://api.notion.com/v1/search", json=search_params, headers=headers
# )


# # Create Page in Notion
# search_results = search_response.json()["results"]
# page_id = search_results[0]["id"]

# create_page_body = {
#     "parent": {"page_id": page_id},
#     "properties": {
#         "title": {"title": [{"type": "text", "text": {"content": "Hello World!"}}]}
#     },
#     "children": [
#         {
#             "object": "block",
#             "type": "paragraph",
#             "paragraph": {
#                 "rich_text": [
#                     {
#                         "type": "text",
#                         "text": {"content": "This page was made using an Api call!"},
#                     }
#                 ]
#             },
#         }
#     ],
# }

# create_response = requests.post(
#     "https://api.notion.com/v1/pages", json=create_page_body, headers=headers
# )
# # print(create_response.json())


# # Retrieve Page Content
# created_id = create_response.json()["id"]
# blocks_response = requests.get(
#     f"https://api.notion.com/v1/blocks/{created_id}/children",
#     headers=headers)
# print(blocks_response.json())


from tools import saveInNotion
from MainAgent import DocumentResponse  # Import DocumentResponse class

# Create a DocumentResponse object instead of a dictionary
dummy_document = DocumentResponse(
    document_title="PETITION UNDER SECTION 482 OF THE CRIMINAL PROCEDURE CODE",
    document_type="Petition",
    document_content="""\
IN THE HIGH COURT OF DELHI AT NEW DELHI

Case No. Crl.M.C. 1234/2024

RAJESH VERMA                                    ... Petitioner
VERSUS
STATE OF MAHARASHTRA                            ... Respondent

PETITION UNDER SECTION 482 OF THE CRIMINAL PROCEDURE CODE, 1973

TO THE HON'BLE CHIEF JUSTICE AND HIS COMPANION JUSTICES OF THE HIGH COURT OF DELHI:

The humble petition of the Petitioner above named:

1. That the Petitioner is a citizen of India and a resident of Mumbai.
2. That FIR No. 56/2024 was registered against the Petitioner under Sections 420, 468 IPC and 66C, 66 of the IT Act at Cyber Cell, Mumbai.
3. That the Petitioner seeks to quash the said FIR on the grounds of false implication and abuse of process.
4. That the allegations in the FIR are baseless, vague, and unsupported by evidence.
5. That the continuation of criminal proceedings would result in miscarriage of justice.

PRAYER
In view of the foregoing, the Petitioner respectfully prays that this Hon'ble Court may be pleased to:
a. Quash FIR No. 56/2024 registered at Cyber Cell, Mumbai;
b. Pass such other and further orders as this Hon’ble Court may deem fit and proper in the interest of justice.

Place: New Delhi
Date: 15 April 2024

(Signed)
Counsel for the Petitioner
Advocate Rajiv Mehta
Enrollment No. D/1234/2010
Chamber 204, Delhi High Court""",
    court_name="HIGH COURT OF DELHI AT NEW DELHI",
    case_number="Crl.M.C. 1234/2024",
    filing_party="Petitioner",
    opposing_party="Respondent",
    certificate_of_service="I hereby certify that a true and correct copy of the above Petition has been served upon the Respondent through the office of the Government Pleader, High Court of Delhi, on this 15th day of April, 2024.",
    next_steps=[
        "Listing before Hon'ble Judge for admission",
        "Notice to be issued to the State of Maharashtra",
        "Filing of counter affidavit by the Respondent",
        "Fixing date for hearing",
    ],
)

print(saveInNotion(dummy_document))
