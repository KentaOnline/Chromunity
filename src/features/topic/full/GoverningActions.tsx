import React, { useState } from "react";
import { ChromunityUser } from "../../../types";
import { connect } from "react-redux";
import { toLowerCase } from "../../../shared/util/util";
import ApplicationState from "../../../core/application-state";
import { IconButton, Tooltip, Menu } from "@material-ui/core";
import { LocationCity } from "@material-ui/icons";
import PinButton from "./PinButton";
import DeleteButton from "./DeleteButton";

interface Props {
  topicId: string;
  representatives: string[];
  rateLimited: boolean;
  user: ChromunityUser;
}

const GoverningActions: React.FunctionComponent<Props> = (props) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement>(null);

  const isRepresentative = () => {
    return (
      props.user != null && props.user.name != null && props.representatives.includes(toLowerCase(props.user.name))
    );
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return isRepresentative() && (
    <>
      <Menu id="gov-actions" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        <PinButton topicId={props.topicId} handleClose={handleClose} />
        <DeleteButton topicId={props.topicId} handleClose={handleClose} />
      </Menu>
      <IconButton onClick={handleClick}>
        <Tooltip title="Governing">
          <LocationCity />
        </Tooltip>
      </IconButton>
    </>
  );
}

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
    representatives: store.government.representatives.map((rep) => toLowerCase(rep)),
    rateLimited: store.common.rateLimited,
  };
};

export default connect(mapStateToProps)(GoverningActions);
