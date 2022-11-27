import React from "react";

type ProfileImageProps = {
    picture: string|null;
    username: string;
    id: string;
};


export default class ProfileImage extends React.Component<ProfileImageProps> {

    render() {

        return (
            <div className="profile-picture" title={this.props.username}>
                {
                    (this.props.picture) ?
                        <img src={this.props.picture}
                             alt={this.props.username}/> :
                        <div className="profile-picture-anonymous"
                             style={{backgroundColor: `hsl(${parseInt(this.props.id,36) % 360},70%,70%)`}}>?</div>
                }
            </div>
        );
    }

}