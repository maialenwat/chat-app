import { Button, TextField } from "@mui/material";
import { Component } from "react";
import { customReactionEmojis } from "./Emoji";
import Reactions from "./Reactions";
import { reactionData } from "./Reactions";

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
   content: string;
   username: string;
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
      this.sendMessage = this.sendMessage.bind(this);
   }

   componentDidMount() {
      this.ws = new WebSocket("ws://localhost:8080/test");

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

   /**
    * sends message to the server
    * @returns
    */
   sendMessage() {
      this.ws?.send(
         JSON.stringify({
            type: "text",
            username: "Maïalen",
            content: this.state.message.trim(),
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
         <section className="flex flex-col w-72 m-10 shadow-md">
            <main className="flex mx-1.5 h-96 overflow-auto">
               <ul>
                  {this.state.messageList.map((msg, index) => {
                     switch (msg.type) {
                        case "text":
                           return (
                              <li className="break-words" key={index}>
                                 <p>
                                    <strong>{msg.username}</strong> : {msg.content}
                                 </p>
                              </li>
                           );
                        case "server":
                           return (
                              <li key={index}>
                                 <em>{msg.content}</em>
                              </li>
                           );
                        case "reaction":
                           return (
                              <li key={index}>
                                 {msg.content}
                              </li>
                           )
                     }
                     return null;
                  })}
               </ul>
            </main>
            
            <Reactions
               onNewReaction={this.sendReaction}
               reactionToRender={this.state.reaction}
            />

            <footer className="flex">
               <TextField
                  variant="outlined"
                  size="small"
                  aria-label="Type a message"
                  placeholder="Type a message"
                  type="text"
                  autoComplete="off"
                  fullWidth
                  value={this.state.message}
                  onChange={(e) => {
                     this.setState({ message: e.target.value })
                  }}
                  onKeyPress={(e) => {
                     if (e.key === "Enter") this.sendMessage();
                  }}
               />
               <Button
                  variant="contained"
                  aria-label="Send Message"
                  onClick={this.sendMessage}
               >
                  Send
               </Button>

            </footer>
         </section>
      )
   }
}