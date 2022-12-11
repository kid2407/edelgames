import React, {ReactNode} from "react";

type IProps = {
    picture: string | null;
    username: string;
    id: string;
};

export default class ProfileImage extends React.Component<IProps, {}> {

    render(): ReactNode {

        let fallbackColorHue = parseInt(this.props.id, 36) % 360;

        return (
            <div className="profile-picture" title={this.props.username}>
                {
                    (this.props.picture) ?
                        <img src={this.props.picture}
                             alt={this.props.username}/>
                        :
                        <div className="profile-picture-anonymous"
                             style={{backgroundColor: `hsl(${fallbackColorHue},60%,60%)`}}>?</div>
                }
            </div>
        );
    }

}