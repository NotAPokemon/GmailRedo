import email
import imaplib
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import time
import threading
from flask import Flask, request, jsonify

app = Flask(__name__)

class EmailHandler:

    def __init__(self, email, password, host="imap.gmail.com"):
        self.email = email
        self.password = password
        self.host = host
        self.imap = None
        self.smtp = None

    def login(self):
        try:
            self.imap = imaplib.IMAP4_SSL(self.host, 993)
            self.imap.login(self.email, self.password)
            
            self.smtp = smtplib.SMTP('smtp.gmail.com', 587)
            self.smtp.starttls()
            self.smtp.login(self.email, self.password)
            
            return "Login successful"
        except imaplib.IMAP4.error as e:
            e = e
            return "IMAP login failed"

    def open_folder(self, folder_name="INBOX"):
        try:
            self.imap.select(mailbox=str(folder_name))
        except Exception as e:
            return "False " + str(e) + str(folder_name)
        return 'True'

    def get_all_folders(self):
        status, labels = self.imap.list()

        if status == 'OK':
            # Extract and print label names
            label_names = [label.decode().split(' "/" ')[-1] for label in labels]
            return label_names
        else:
            return 'error'

    def get_messages(self):
        result, data = self.imap.search(None, 'ALL')
        message_ids = data[0].split()
        messages = []

        for msg_id in message_ids[::-1]:
            result, msg_data = self.imap.fetch(msg_id, '(RFC822)')
            raw_email = msg_data[0][1]
            flags = msg_data[0][0].decode('utf-8')

            # Parse the raw email to get headers and body
            msg = email.message_from_bytes(raw_email)

            seen = '\\Seen' in flags

            # Build the result dictionary safely
            messages.append({
                "subject": msg.get("subject", "No Subject"),
                "from": msg.get("from", "Unknown Sender"),
                "date": msg.get("date", "No Date"),
                'body': get_body(msg),
                'seen': seen
            })

        return messages

    def close_folder(self):
        self.imap.close()

    def logout(self):
        self.imap.logout()

    def is_upto_date(self):
        result, data = self.imap.search(None, 'UNSEEN')
        return len(data[0].split()) == 0

    def check_for_new_emails(self):
        result, data = self.imap.search(None, 'UNSEEN')
        message_ids = data[0].split()
        for msg_id in message_ids:
            result, msg_data = self.imap.fetch(msg_id, '(RFC822)')
            message = msg_data[0][1]
            self.handle_new_email(message)

    def handle_new_email(self, message):
        print("New email received!")

    def start_checking(self, interval):
        def run():
            while True:
                self.check_for_new_emails()
                time.sleep(interval)

        threading.Thread(target=run, daemon=True).start()

    def new_folder(self, name):
        try:
            self.imap.create(name)
            return True
        except Exception as e:
            return 'an error occured during creation: ' + str(e)
        
    def delete_folder(self, name):
        if self.open_folder(name) == 'True':
            self.close_folder()
            try:
                self.imap.delete(name)
                return True, 'works'
            except Exception as e:
                return False, 'an error occured during deletion' + str(e)
        else:
            return False, self.open_folder(name)

    def send_email(self, recipient, subject, body):
        try:
            msg = MIMEMultipart()
            msg['From'] = self.email
            msg['To'] = recipient
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'plain'))
            self.smtp.send_message(msg)
            print(f"Email sent successfully to {recipient}")
            return True, 'none'
        except Exception as e:
            return False, 'error occured while sending email: ' + str(e)

    def move_email(self, msg_id, destination):
        self.imap.copy(msg_id, destination)
        self.imap.store(msg_id, '+FLAGS', '\\Deleted')
        self.imap.expunge()


def remove_extra(arg) -> list:
    return [s.replace('"', '') for s in arg]

def get_body(msg):
    """Extracts the body from an email message."""
    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            content_disposition = str(part.get("Content-Disposition"))
            if content_type == "text/plain" and "attachment" not in content_disposition:
                return safe_decode(part.get_payload(decode=True))  # Decode byte content to string
    else:
        return safe_decode(msg.get_payload(decode=True))  # For non-multipart messages
    return ""

def safe_decode(byte_content):
    """Attempts to decode byte content to a string, handling errors."""
    if byte_content:
        try:
            return byte_content.decode('utf-8')
        except UnicodeDecodeError:
            return byte_content.decode('latin-1', errors='replace')  # Fallback to latin-1
    return ""


@app.route("/login", methods=['POST'])
def login():
    data = request.json
    emailHandler = EmailHandler(data['email'], data['password'])
    result = emailHandler.login()
    emailHandler.logout()
    return jsonify({"status":result })


@app.route("/open_folder", methods=['POST'])
def openFolder():
    data = request.json
    emailHandler = EmailHandler(data['email'], data['password'])
    emailHandler.login()
    result = emailHandler.open_folder(data['folder'])
    return jsonify({'status': result})

@app.route('/get_email', methods=['POST'])
def getEmails():
    data = request.json
    emailHandler = EmailHandler(data['email'], data['password'])
    emailHandler.login()
    emailHandler.open_folder(data['folder'])
    list = emailHandler.get_messages()
    result = [{"subject": msg["subject"], "from": msg["from"], "date": msg["date"], 'body': msg['body'], 'seen': msg['seen']} for msg in list]
    emailHandler.close_folder()
    emailHandler.logout()
    return jsonify({"messages": result})

@app.route('/get_all_folders', methods=['POST'])
def getAllFolders():
    data = request.json
    emailHandler = EmailHandler(data['email'], data['password'])
    emailHandler.login()
    emailHandler.open_folder('[Gmail]')
    result = emailHandler.get_all_folders()
    emailHandler.logout()
    return jsonify({"folders": result})

@app.route('/new_folder', methods=['POST'])
def createNewFolder():
    data = request.json
    emailHandler = EmailHandler(data['email'], data['password'])
    emailHandler.login()
    result = emailHandler.new_folder(data['name'])
    emailHandler.logout()
    return jsonify({'result': result})


@app.route('/send_email', methods=['POST'])
def sendMail():
    data = request.json
    emailHandler = EmailHandler(data['email'], data['password'])
    emailHandler.login()
    result, error = emailHandler.send_email(data['to'], data['subject'], data['body'])
    emailHandler.logout()
    return jsonify({'result': result, 'status': error})

@app.route('/delete_folder', methods=['POST'])
def deleteFolder():
    data = request.json
    emailHandler = EmailHandler(data['email'], data['password'])
    emailHandler.login()
    result, error = emailHandler.delete_folder(data['name'])
    emailHandler.logout()
    return jsonify({'result': result, 'status': error})




if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5555)


