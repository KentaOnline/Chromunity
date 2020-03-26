import React from "react";
import { ReactTinyLink } from "react-tiny-link";
import * as ResponsiveEmbed from "react-responsive-embed";
import makeStyles from "@material-ui/core/styles/makeStyles";

interface Props {
  text: string;
}

const useStyles = makeStyles(theme => ({
  tinyLink: {
    marginBottom: "5px"
  },
  iframeWrapper: {
    width: "60%"
  }
}));

const URL_REGEX = /https?:\/\/(?![^" ]*(?:jpg|jpeg|png|gif))[^" ]+/gi;
const YOUTUBE_ID_REGEX = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;

const PreviewLinks: React.FunctionComponent<Props> = props => {
  const classes = useStyles();

  function getLastLink(): string {
    const urls = props.text.match(URL_REGEX);
    return urls && urls.length > 0 ? urls[urls.length - 1] : null;
  }

  function isValidYouTubeUrl(url: string) {
    if (url !== undefined || url !== "") {
      const match = url.match(YOUTUBE_ID_REGEX);
      return match && match[2].length >= 11;
    }

    return false;
  }

  function parseYouTubeVideoId(url: string) {
    const match = url.match(YOUTUBE_ID_REGEX);
    return match && match[2].length >= 11 ? match[2] : null;
  }

  function getLink(url: string) {
    if (isValidYouTubeUrl(url)) {
      const id = parseYouTubeVideoId(url);
      return (
        <div className={classes.iframeWrapper}>
        <ResponsiveEmbed src={"https://www.youtube.com/embed/" + id} ratio="16:9" allowFullScreen />
        </div>
      )
    } else {
      return <ReactTinyLink cardSize={"small"} showGraphic={true} maxLine={2} minLine={1} url={url} />;
    }
  }

  function renderLink(url: string) {
    if (url) {
      return (<div className={classes.tinyLink}>
        {getLink(url)}
      </div>);
    } else {
      return <div />;
    }
  }

  return renderLink(getLastLink());
};

export default PreviewLinks;
