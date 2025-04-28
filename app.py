from flask import Flask, request, jsonify
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

# Создаем Flask приложение
app = Flask(__name__)

# Параметры Google Sheets
SPREADSHEET_ID = '17vAx26XcUJEJ8POW6zwJ-oUHGK0uoNF5PlYuXwFgdsU'
RANGE = 'Sheet1!A2:H'

# Настройка Google API
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
credentials = Credentials.from_service_account_file('google_credentials.json', scopes=SCOPES)
service = build('sheets', 'v4', credentials=credentials)

# Эндпоинт для получения данных из Google Sheets
@app.route('/products', methods=['GET'])
def get_products():
    try:
        sheet = service.spreadsheets()
        result = sheet.values().get(spreadsheetId=SPREADSHEET_ID, range=RANGE).execute()
        rows = result.get('values', [])

        # Преобразуем данные в удобный формат
        products = []
        for i, row in enumerate(rows, start=2):  # Стартуем с 2, чтобы учесть строки в таблице
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

# Эндпоинт для обновления остатков на складе
@app.route('/updateInventory', methods=['POST'])
def update_inventory():
    try:
        data = request.json
        product_id = data.get('id')
        ordered_quantity = data.get('orderedQuantity')

        # Проверяем входные данные
        if product_id is None or ordered_quantity is None:
            return jsonify({'error': 'Отсутствуют необходимые данные'}), 400

        # Получаем текущие данные о продукте
        product_range = f'Sheet1!D{product_id + 1}:H{product_id + 1}'
        sheet = service.spreadsheets()
        response = sheet.values().get(spreadsheetId=SPREADSHEET_ID, range=product_range).execute()

        if not response.get('values'):
            return jsonify({'error': 'Продукт не найден'}), 404

        product_data = response['values'][0]
        total_quantity = int(product_data[0]) if len(product_data) > 0 and product_data[0].isdigit() else 0
        current_available_quantity = int(product_data[3]) if len(product_data) > 3 and product_data[3].isdigit() else total_quantity

        # Рассчитываем новый остаток
        new_available_quantity = current_available_quantity - ordered_quantity
        if new_available_quantity < 0:
            return jsonify({'error': 'Недостаточно товара на складе'}), 400

        # Обновляем остаток в таблице
        sheet.values().update(
            spreadsheetId=SPREADSHEET_ID,
            range=f'Sheet1!H{product_id + 1}',
            valueInputOption='RAW',
            body={'values': [[new_available_quantity]]}
        ).execute()

        return jsonify({'message': 'Остаток успешно обновлен'})
    except Exception as e:
        print(f'Ошибка при обновлении данных: {e}')
        return jsonify({'error': 'Не удалось обновить данные'}), 500

# Запуск приложения
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)