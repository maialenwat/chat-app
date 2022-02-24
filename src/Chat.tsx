import Button from "@mui/material/Button";
import Input from "@mui/material/Input";
import { Component } from "react";
import Reaction, { reactionData } from "./Reaction";
import { customReactionEmojis } from "./Emoji";
import "./Chat.Style.scss";

interface BaseMessage<T> {
    type: T;
}

type HistoryMessage = BaseMessage<"history"> & {
    content: Message[];
}

type ServerMessage = BaseMessage<"server"> & {
    content: string;
}

type TextMessage = BaseMessage<"text"> & {
    sender: string;
    body: string;
    sentAt: number;
}

type ReactionMessage = BaseMessage<"reaction"> & {
    content: typeof emoji;
}

type LoginMessage = BaseMessage<"login"> & {
    content: string;
    username: string;
    picture: string;
}

type ChatState = {
    message: string;
    messageList: Message[];
    reactionList: ReactionMessage[];
    reaction: reactionData | null;
}

type Message = TextMessage | LoginMessage | ServerMessage | HistoryMessage | ReactionMessage;

const emoji = customReactionEmojis;

export default class Chat extends Component {
    ws: WebSocket | undefined;

    state: ChatState = {
        message: "",
        messageList: [],
        reactionList: [],
        reaction: null,
    }

    constructor(props: any) {
        super(props);
        this.send = this.send.bind(this);
    }

    componentDidMount() {
        this.ws = new WebSocket("ws://localhost:8081");

        this.ws.binaryType = "arraybuffer";

        this.ws.onopen = function (event: Event) {
            console.log("/!\\ Connection to server established");

            // login
            this.send(
                JSON.stringify({
                    type: "login",
                    username: "Maïalen",
                    picture: "",
                    content: "",
                })
            );
        };

        // on data received from server
        this.ws.onmessage = (event: MessageEvent) => {

            const data = JSON.parse(event.data) as Message;
            console.log(data);

            if (data.type === "reaction") {
                this.setState({ reaction: data.content });
            } else {
                // creates a copy of the current messages list
                const msgList = this.state.messageList;

                // adds the new message
                msgList.push(data);

                // updates the state of the component
                this.setState({
                    messageList: msgList,
                });
            }
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
        this.ws?.send(
            JSON.stringify({
                type: "text",
                sender: "Maïalen",
                body: this.state.message.trim(),
                timestamp: Date.now(),
            })
        );
        this.setState({ message: "" });
    }

    /**
 * Envoi la réaction au serveur
 * Cette méthode sert de callback pour le composant Reactions.tsx
 * @param emoji
 */
    sendReaction = (emoji: reactionData) => {
        this.ws?.send(
            JSON.stringify({
                type: "reaction",
                content: emoji,
                timestamp: Date.now(),
            })
        );
    };

    render() {
        return (
            <main>
                <header>
                    <h1>Chat room</h1>
                </header>

                <div className="chat-view-container">
                    <ul>
                        {this.state.messageList.map((msg, index) => {
                            switch (msg.type) {
                                case "text":
                                    return (
                                        <li className="message" key={index}>
                                            <p>
                                                <strong>{msg.sender}</strong> : {msg.body}
                                                <span>
                                                    {new Date(msg.sentAt).toLocaleTimeString(undefined, { timeStyle: 'short' })}
                                                </span>
                                            </p>
                                        </li>
                                    );
                                case "server":
                                    return (
                                        <li>
                                            <em>{msg.content}</em>
                                        </li>
                                    );
                                case "reaction":
                                    return (
                                        <li>{msg.content}</li>
                                    )
                            }
                            return null;
                        })}

                    </ul>

                </div>

                <footer>
                    <div>
                        <Input
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
                        <Button
                            variant="contained"
                            aria-label="Send Message"
                            onClick={this.send}
                        >
                            Send
                        </Button>
                        <Reaction
                            onNewReaction={this.sendReaction}
                            reactionToRender={this.state.reaction}
                        />
                    </div>
                </footer>
            </main>
        )
    }
}