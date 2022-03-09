import { Grid, IconButton, TextField } from "@mui/material";
import { Component } from "react";
import { customReactionEmojis } from "./Emojis";
import Reactions from "./Reactions";
import { reactionData } from "./Reactions";
import SendIcon from '@mui/icons-material/Send';
import './Chat.css'

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
   * Sends reaction to server
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
         <div className="container">

            {/* message thread */}
            <div className="messages">
               <ul>
                  {this.state.messageList.map((msg, index) => {
                     switch (msg.type) {
                        case "text":
                           return (
                              <li className="message" key={index}>
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
                           return <li key={index}>{msg.content}</li>
                     }
                     return null;
                  })}
               </ul>
            </div>

            <div className="chat-footer">
                  <Grid container spacing={1} direction="row" alignItems="center">
                     
                     {/* reactions */}
                     <Grid item xs={8}>
                        <Reactions
                           onNewReaction={this.sendReaction}
                           reactionToRender={this.state.reaction}
                        />
                     </Grid>

                     {/* message input */}
                     <Grid item xs={10}>
                        <TextField
                           variant="outlined"
                           size="small"
                           type="text"
                           label="Message"
                           aria-label="Type a message"
                           placeholder="Type a message"
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
                     </Grid>

                     {/* send button */}
                     <Grid className="send-btn" item xs={2} justifyContent="center">
                        <IconButton
                           color="primary"
                           aria-label="Send Message"
                           onClick={this.sendMessage}
                        >
                           <SendIcon />
                        </IconButton>
                     </Grid>
                  </Grid>
            </div>
         </div>
      )
   }
}