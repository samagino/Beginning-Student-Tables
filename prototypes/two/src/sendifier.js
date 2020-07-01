function sessionURL(sessionID) {
    return `${process.env.PUBLIC_URL}/log/session${sessionID}`;
}

class Sendifier {
    constructor(delay, sessionID) {
        this.delay = delay;
        this.url = sessionURL(sessionID);
        this.item = false;
        this.sendItem = this.sendItem.bind(this);
        this.sendItem();
    }

    sendItem() {
        this.clear();
        if (this.item) {
            const sent = this.item;
            fetch(this.url, {
                method: 'POST', // or 'PUT'
                body: JSON.stringify(sent), // data can be `string` or {object}!
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' }})
            .then(() => {
                      this.timerID = setTimeout(this.sendItem, this.delay);
                  },
                  () => {
                      if (!this.item) this.item = sent;
                      this.timerID = setTimeout(this.sendItem, this.delay);
                  });
            this.item = false;
        } else {
            this.timerID = setTimeout(this.sendItem, this.delay);
        }
    }

    setItem(news) {
        this.item = news;
    }

    clear() {
        if (this.timerID) {
            clearTimeout(this.timerID);
            delete this.timerID;
        }
    }
}

export { sessionURL, Sendifier };
