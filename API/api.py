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
            self.imap = imaplib.IMAP4_SSL(self.host)
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
            self.imap.select(mailbox=str(folder_name.strip()))
        except Exception as e:
            return "False " + str(e) + str(folder_name)
        return 'True'

    def get_all_folders(self):
        return self.imap.list()

    def get_messages(self):
        result, data = self.imap.search(None, 'ALL')
        message_ids = data[0].split()
        messages = []
        for msg_id in message_ids:
            result, msg_data = self.imap.fetch(msg_id, '(RFC822)')
            messages.append(msg_data[0][1])
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

    def send_email(self, recipient, subject, body):
        msg = MIMEMultipart()
        msg['From'] = self.email
        msg['To'] = recipient
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))
        self.smtp.send_message(msg)
        print(f"Email sent successfully to {recipient}")

    def move_email(self, msg_id, destination):
        self.imap.copy(msg_id, destination)
        self.imap.store(msg_id, '+FLAGS', '\\Deleted')
        self.imap.expunge()



def get_body(msg):
    """Extracts the body from an email message."""
    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            content_disposition = str(part.get("Content-Disposition"))
            if content_type == "text/plain" and "attachment" not in content_disposition:
                return part.get_payload(decode=True).decode()  # Decode byte content to string
    else:
        return msg.get_payload(decode=True).decode()  # For non-multipart messages
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
    result = [{"subject": msg["subject"], "from": msg["from"], "date": msg["date"], 'body': get_body(msg)} for msg in list]
    emailHandler.close_folder()
    emailHandler.logout()
    return jsonify({"messages": result})

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5555)


