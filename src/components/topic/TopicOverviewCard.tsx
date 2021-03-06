import React from "react";
import { Link } from "react-router-dom";
import { Topic, ChromunityUser } from "../../types";
import {
  Badge,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  createStyles,
  Typography,
  withStyles,
  WithStyles
} from "@material-ui/core";
import { prepareUrlPath, stringToHexColor } from "../../util/util";
import { getUser, ifEmptyAvatarThenPlaceholder } from "../../util/user-util";
import { StarBorder, StarRate } from "@material-ui/icons";
import { getUserSettingsCached } from "../../blockchain/UserService";
import { Redirect } from "react-router";
import { getTopicStarRaters } from "../../blockchain/TopicService";
import { getTopicChannelBelongings } from "../../blockchain/ChannelService";
import { COLOR_ORANGE, COLOR_YELLOW } from "../../theme";
import Avatar, { AVATAR_SIZE } from "../common/Avatar";
import Timestamp from "../common/Timestamp";
import { ApplicationState } from "../../redux/Store";
import { loadRepresentatives } from "../../redux/actions/GovernmentActions";
import { connect } from "react-redux";

const styles = createStyles({
  representativeColor: {
    color: COLOR_ORANGE
  },
  authorName: {
    display: "block",
    marginTop: "10px",
    marginRight: "10px",
    marginLeft: "5px"
  },
  rating: {
    marginTop: "10px"
  },
  overviewDetails: {
    marginLeft: "42px"
  },
  iconYellow: {
    color: COLOR_YELLOW
  },
  tagChips: {
    display: "inline"
  },
  removed: {
    opacity: 0.5
  }
});

interface Props extends WithStyles<typeof styles> {
  topic: Topic;
  representatives: string[];
  loadRepresentatives: typeof loadRepresentatives;
}

interface State {
  stars: number;
  ratedByMe: boolean;
  redirectToFullCard: boolean;
  avatar: string;
  channels: string[];
  user: ChromunityUser;
}

const TopicOverviewCard = withStyles(styles)(
  class extends React.Component<Props, State> {
    constructor(props: Props) {
      super(props);

      this.props.loadRepresentatives();

      this.state = {
        stars: 0,
        channels: [],
        ratedByMe: false,
        redirectToFullCard: false,
        avatar: "",
        user: getUser()
      };

      this.authorIsRepresentative = this.authorIsRepresentative.bind(this);
    }

    render() {
      if (this.state.redirectToFullCard) {
        return <Redirect to={"/t/" + this.props.topic.id + "/" + prepareUrlPath(this.props.topic.title)} push />;
      } else {
        return (
          <div className={this.props.topic.removed ? this.props.classes.removed : ""}>
            <Card raised={true} key={this.props.topic.id}>
              <CardActionArea onClick={() => this.setState({ redirectToFullCard: true })}>
                {this.renderCardContent()}
              </CardActionArea>
            </Card>
          </div>
        );
      }
    }

    componentDidMount() {
      getTopicChannelBelongings(this.props.topic.id).then(channels => this.setState({ channels: channels }));
      getUserSettingsCached(this.props.topic.author, 1440).then(settings =>
        this.setState({
          avatar: ifEmptyAvatarThenPlaceholder(settings.avatar, this.props.topic.author)
        })
      );

      const user: ChromunityUser = this.state.user;
      getTopicStarRaters(this.props.topic.id).then(usersWhoStarRated =>
        this.setState({
          stars: usersWhoStarRated.length,
          ratedByMe: usersWhoStarRated.includes(user != null && user.name.toLocaleLowerCase())
        })
      );
    }

    authorIsRepresentative(): boolean {
      return this.props.representatives.includes(this.props.topic.author.toLocaleLowerCase());
    }

    renderAuthor() {
      return (
        <div style={{ float: "right" }}>
          <Link to={"/u/" + this.props.topic.author}>
            <Typography
              gutterBottom
              variant="subtitle2"
              component="span"
              className={this.authorIsRepresentative() ? this.props.classes.representativeColor : ""}
            >
              <span className={this.props.classes.authorName}>@{this.props.topic.author}</span>
            </Typography>
          </Link>
          <div style={{ float: "right" }}>
            <Avatar src={this.state.avatar} size={AVATAR_SIZE.SMALL} name={this.props.topic.author}/>
          </div>
        </div>
      );
    }

    renderTagChips() {
      if (this.state.channels != null) {
        return (
          <div className={this.props.classes.tagChips}>
            {this.state.channels.map(tag => {
              return (
                <Link key={this.props.topic.id + ":" + tag} to={"/c/" + tag.replace("#", "")}>
                  <Chip
                    size="small"
                    label={"#" + tag}
                    style={{
                      marginLeft: "1px",
                      marginRight: "1px",
                      marginBottom: "3px",
                      backgroundColor: stringToHexColor(tag),
                      cursor: "pointer"
                    }}
                  />
                </Link>
              );
            })}
          </div>
        );
      }
    }

    renderCardContent() {
      return (
        <CardContent>
          <div style={{ float: "left" }}>
            <div className={this.props.classes.rating}>
              <Badge color="secondary" badgeContent={this.state.stars}>
                {this.state.ratedByMe ? <StarRate className={this.props.classes.iconYellow} /> : <StarBorder />}
              </Badge>
            </div>
          </div>
          {this.renderAuthor()}
          <div className={this.props.classes.overviewDetails}>
            <Timestamp milliseconds={this.props.topic.last_modified} />
            <Typography variant="subtitle1" component="span" style={{ marginRight: "10px" }}>
              {this.props.topic.title}
            </Typography>
            {this.renderTagChips()}
          </div>
        </CardContent>
      );
    }
  }
);

const mapStateToProps = (store: ApplicationState) => {
  return {
    representatives: store.government.representatives
  }
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    loadRepresentatives: () => dispatch(loadRepresentatives())
  }
};

export default connect(mapStateToProps, mapDispatchToProps) (TopicOverviewCard);
