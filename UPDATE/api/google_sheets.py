from googleapiclient.discovery import build
from google.oauth2.service_account import Credentials

# Настройка Google Sheets
SPREADSHEET_ID = '17vAx26XcUJEJ8POW6zwJ-oUHGK0uoNF5PlYuXwFgdsU'
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
credentials = Credentials.from_service_account_file('google_credentials.json', scopes=SCOPES)
service = build('sheets', 'v4', credentials=credentials)

def get_sheets_data(range_name):
    """Получает данные из Google Sheets."""
    sheet = service.spreadsheets()
    response = sheet.values().get(spreadsheetId=SPREADSHEET_ID, range=range_name).execute()
    return response.get('values', [])

def update_sheets_data(range_name, values):
    """Обновляет данные в Google Sheets."""
    sheet = service.spreadsheets()
    body = {'values': values}
    sheet.values().update(
        spreadsheetId=SPREADSHEET_ID,
        range=range_name,
        valueInputOption='RAW',
        body=body
    ).execute()