import React from "react";

import { Badge, createStyles, Dialog, Snackbar, Tooltip, WithStyles } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import { getCachedUserMeta, getUser } from "../../util/user-util";
import { CustomSnackbarContentWrapper } from "../common/CustomSnackbar";
import { ChromunityUser, UserMeta } from "../../types";
import { Edit } from "@material-ui/icons";
import { parseEmojis } from "../../util/text-parsing";
import EmojiPicker from "../common/EmojiPicker";
import withStyles from "@material-ui/core/styles/withStyles";

const styles = createStyles({
  editorWrapper: {
    position: "relative"
  }
});

export interface EditMessageButtonProps extends WithStyles<typeof styles> {
  submitFunction: Function;
  value: string;
  modifiableUntil: number;
}

export interface EditMessageButtonState {
  dialogOpen: boolean;
  message: string;
  replyStatusSuccessOpen: boolean;
  replyStatusErrorOpen: boolean;
  replySentStatus: string;
  userMeta: UserMeta;
  user: ChromunityUser;
}

const EditMessageButton = withStyles(styles)(
  class extends React.Component<EditMessageButtonProps, EditMessageButtonState> {
    private textInput: React.RefObject<HTMLInputElement>;

    constructor(props: EditMessageButtonProps) {
      super(props);

      this.state = {
        message: props.value,
        dialogOpen: false,
        replyStatusSuccessOpen: false,
        replyStatusErrorOpen: false,
        replySentStatus: "",
        userMeta: {
          name: "",
          suspended_until: Date.now() + 10000,
          times_suspended: 0
        },
        user: getUser()
      };

      this.textInput = React.createRef();

      this.toggleDialog = this.toggleDialog.bind(this);
      this.submit = this.submit.bind(this);
      this.handleDialogMessageChange = this.handleDialogMessageChange.bind(this);
      this.handleClose = this.handleClose.bind(this);
      this.addEmoji = this.addEmoji.bind(this);
    }

    componentDidMount() {
      getCachedUserMeta().then(meta => this.setState({ userMeta: meta }));
    }

    toggleDialog() {
      this.setState(prevState => ({ dialogOpen: !prevState.dialogOpen }));
    }

    handleDialogMessageChange(event: React.ChangeEvent<HTMLInputElement>) {
      event.preventDefault();
      event.stopPropagation();
      this.setState({ message: parseEmojis(event.target.value) });
    }

    submit() {
      this.toggleDialog();
      this.props.submitFunction(this.state.message);
    }

    newTopicDialog() {
      return (
        <div>
          <Dialog open={this.state.dialogOpen} aria-labelledby="form-dialog-title" fullWidth={true} maxWidth={"md"}>
            <form onSubmit={() => this.props.submitFunction(this.state.message)}>
              <DialogContent>
                <br />
                <div className={this.props.classes.editorWrapper}>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="message"
                    multiline
                    label="Text"
                    type="text"
                    rows="3"
                    rowsMax="15"
                    variant="outlined"
                    fullWidth
                    onChange={this.handleDialogMessageChange}
                    value={this.state.message}
                    inputRef={this.textInput}
                  />
                  <EmojiPicker emojiAppender={this.addEmoji} />
                </div>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => this.toggleDialog()} color="secondary" variant="contained">
                  Cancel
                </Button>
                <Button
                  onKeyPress={e => (e.key === "Enter" ? this.submit() : "")}
                  onClick={() => this.submit()}
                  color="primary"
                  variant="contained"
                >
                  Send
                </Button>
              </DialogActions>
            </form>
          </Dialog>

          <Snackbar
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left"
            }}
            open={this.state.replyStatusSuccessOpen}
            onClose={this.handleClose}
            autoHideDuration={3000}
          >
            <CustomSnackbarContentWrapper
              variant="success"
              message={this.state.replySentStatus}
            />
          </Snackbar>
          <Snackbar
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left"
            }}
            open={this.state.replyStatusErrorOpen}
            autoHideDuration={3000}
            onClose={this.handleClose}
          >
            <CustomSnackbarContentWrapper
              variant="error"
              message={this.state.replySentStatus}
            />
          </Snackbar>
        </div>
      );
    }

    addEmoji(emoji: string) {
      const startPosition = this.textInput.current.selectionStart;

      this.setState(prevState => ({
        message: [
          prevState.message.slice(0, startPosition),
          emoji,
          prevState.message.slice(startPosition)
        ].join("")
      }));

      setTimeout(() => {
        this.textInput.current.selectionStart = startPosition + emoji.length;
        this.textInput.current.selectionEnd = startPosition + emoji.length;
      }, 100);
    }

    render() {
      if (this.state.user != null && this.state.userMeta.suspended_until < Date.now()) {
        return (
          <div style={{ display: "inline-block" }}>
            <Tooltip title="Edit">
              <IconButton aria-label="Edit" onClick={() => this.toggleDialog()}>
                <Badge max={600} badgeContent={this.props.modifiableUntil} color="secondary">
                  <Edit />
                </Badge>
              </IconButton>
            </Tooltip>
            {this.newTopicDialog()}
          </div>
        );
      } else {
        return null;
      }
    }

    private handleClose(event: React.SyntheticEvent | React.MouseEvent, reason?: string) {
      if (reason === "clickaway") {
        return;
      }

      this.setState({
        replyStatusSuccessOpen: false,
        replyStatusErrorOpen: false
      });
    }
  }
);

export default EditMessageButton;
