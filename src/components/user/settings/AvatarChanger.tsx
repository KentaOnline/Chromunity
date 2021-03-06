import React from 'react';

import Avatar from 'react-avatar-edit';
import {createStyles, WithStyles, withStyles} from "@material-ui/core";

const styles = createStyles({
   avatarChanger: {
       margin: "0 auto",
       border: "none",
       width: "100%"
   }
});

export interface AvatarChangerProps extends WithStyles<typeof styles> {
    updateFunction: Function,
    previousPicture: string
}

export interface AvatarChangerState {
    src: string
}

const AvatarChanger = withStyles(styles)(
    class extends React.Component<AvatarChangerProps, AvatarChangerState> {

    constructor(props: AvatarChangerProps) {
        super(props);
        this.state = {src: ""};

        this.onCrop = this.onCrop.bind(this);
    }

    compressImage(base64: string): Promise<string> {
        const canvas = document.createElement('canvas');
        const img = document.createElement('img');

        return new Promise((resolve, reject) => {
            img.onload = function () {
                let width = img.width;
                let height = img.height;
                const maxHeight = 128;
                const maxWidth = 128;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height *= maxWidth / width));
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width *= maxHeight / height));
                        height = maxHeight;
                    }
                }
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                resolve(canvas.toDataURL('image/jpeg', 0.9))
            };
            img.onerror = function (err) {
                reject(err);
            };

            img.src = base64;
        })
    }

    onCrop(preview: string) {
        this.compressImage(preview).then(img => {
            this.setState({src: img});
            this.props.updateFunction(img);
        });
    }

    render() {
        return (
            <Avatar
                width={"99%"}
                height={128}
                onCrop={this.onCrop}
                src={this.state.src}
                className={this.props.classes.avatarChanger}
            />
        );
    }
}
);

export default AvatarChanger;
