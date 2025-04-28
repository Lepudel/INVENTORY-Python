from flask import Blueprint, jsonify, request
from googleapiclient.discovery import build
from google.oauth2.service_account import Credentials

# Создаем Blueprint для маршрутов
products_bp = Blueprint('products', __name__)

# Инициализация Google Sheets
SPREADSHEET_ID = '17vAx26XcUJEJ8POW6zwJ-oUHGK0uoNF5PlYuXwFgdsU'
RANGE = 'Sheet1!A2:H'
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
credentials = Credentials.from_service_account_file('google_credentials.json', scopes=SCOPES)
service = build('sheets', 'v4', credentials=credentials)

# Эндпоинт для получения данных из Google Sheets
@products_bp.route('/products', methods=['GET'])
def get_products():
    try:
        sheet = service.spreadsheets()
        result = sheet.values().get(spreadsheetId=SPREADSHEET_ID, range=RANGE).execute()
        rows = result.get('values', [])

        products = []
        for i, row in enumerate(rows, start=2):
            id = int(row[0]) if len(row) > 0 and row[0].isdigit() else i
            name = row[1] if len(row) > 1 else ''
            description = row[2] if len(row) > 2 else ''
            quantity = int(row[3]) if len(row) > 3 and row[3].isdigit() else 0
            image_urls = row[4].split(',') if len(row) > 4 and row[4] else []
            category = row[5] if len(row) > 5 else ''
            quantity_available = int(row[7]) if len(row) > 7 and row[7].isdigit() else quantity

            products.append({
                'id': id,
                'name': name,
                'description': description,
                'quantity': quantity,
                'imageURLs': image_urls,
                'category': category,
                'quantityAvailable': quantity_available
            })

        return jsonify(products)
    except Exception as e:
        print(f'Ошибка при получении данных: {e}')
        return jsonify({'error': 'Не удалось получить данные из Google Sheets'}), 500