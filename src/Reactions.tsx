import { Component } from 'react';
import { Emoji, EmojiData, Picker } from 'emoji-mart';
import { customReactionEmojis } from './Emoji';
import "./Reaction.Style.scss"

interface ReactionsState {
    selectedEmojis: reactionData[];
}

interface ReactionsProps {
    onNewReaction: (emoji: reactionData) => void;
    reactionToRender?: reactionData | null;
}

export interface reactionData {
    emoji: EmojiData;
    offset: number;
}

export default class Reactions extends Component<ReactionsProps, ReactionsState> {

    state: ReactionsState = {
        selectedEmojis: [],
    }

    componentDidUpdate(prevProps: Readonly<ReactionsProps>, prevState: Readonly<ReactionsState>, snapshot?: any) {
        if (prevProps.reactionToRender !== this.props.reactionToRender && this.props.reactionToRender) {
            this.setState({
                selectedEmojis: [...this.state.selectedEmojis, this.props.reactionToRender],
            })

            setTimeout(() =>
                this.setState({
                    selectedEmojis: this.state.selectedEmojis.filter(id => id !== this.props.reactionToRender)
                }), 5000);
        }
    }


    handleEmojiSelect = (emoji: any) => {
        this.props.onNewReaction({emoji: emoji, offset: Math.floor(Math.random() * 80)});
    }


    render() {
        return (
            <article className="reactions">
                {this.state.selectedEmojis.map((reaction, index) => {
                    return (
                        <li className='animated-emoji' style={{ right: reaction.offset }} key={index}>
                            <Emoji emoji={reaction.emoji} size={32} set="facebook" />
                        </li>
                    )
                })}
                
                <Picker
                    perLine={4}
                    include={['custom']}
                    custom={customReactionEmojis}
                    onSelect={this.handleEmojiSelect}
                    set="facebook"
                />
            </article>
        );
    }
}