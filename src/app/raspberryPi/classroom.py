import nfc
import nfc.snep
import threading
import ndef

server = None


def send_ndef_message(llc):
    sp_record = ndef.TextRecord('P1111')
    nfc.snep.SnepClient(llc).put_records([sp_record])


def connected(llc):
    threading.Thread(target=send_ndef_message, args=(llc,)).start()
    return True


clf = nfc.ContactlessFrontend("ttyS0")
clf.connect(llcp={'on-connect': connected})
