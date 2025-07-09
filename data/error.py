from sys import exit

def handle_error(url, code):
    print(f"An error occurred accessing {url}.")
    print(code)
    exit(1)
