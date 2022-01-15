import { Component } from "react";

export default class Chat extends Component {
    ws: WebSocket | undefined;

    state = {
        message: "",
        messageList: [],
    }

    constructor(props: any) {
        super(props);
        this.send = this.send.bind(this);
    }

    componentDidMount() {
        this.ws = new WebSocket("ws://localhost:8081");

        this.ws.onopen = function (event: Event) {
            console.log("/!\\ Connection to server established");

        }

        // on data received from server
        this.ws.onmessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            console.log(data);

        }

        // to handle any error that occur
        this.ws.onerror = function (error) {
            console.log("WebSocket Error: " + error);

        };

    }

    componentWillUnmount() {
        this.ws?.close();
    }

    send() {
        if (this.state.message === '') return;
        this.ws?.send(JSON.stringify({
            type: "text",
            sender: "Maïalen",
            body: this.state.message.trim(),
            timestamp: Date.now(),
        }));
        this.setState({ message: "" });
    }

    render() {
        return (
            <main>
                <header>
                    <h1>Websocket chat room</h1>
                </header>

                <div>

                </div>

                <footer>
                    <div>
                        <input
                            autoFocus
                            aria-label="Type a message"
                            placeholder="Type a message"
                            type="text"
                            autoComplete="off"
                            value={this.state.message}
                            onChange={(e) => {
                                this.setState({ message: e.target.value })
                            }}
                            onKeyPress={(e) => {
                                if (e.key === "Enter") this.send();
                            }}
                        />
                        <button
                            aria-label="Send"
                            onClick={this.send}
                        >
                            Send
                        </button>
                    </div>
                </footer>
            </main>
        )
    }
}