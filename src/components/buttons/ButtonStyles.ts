import { createStyles, Theme } from "@material-ui/core";

export const largeButtonStyles = (theme: Theme) => createStyles({
    buttonWrapper: {
        position: "fixed",
        bottom: "1px",
        right: "1px"
    },
    button: {
        backgroundColor: theme.palette.primary.main,
        marginRight: "5px",
        marginBottom: "5px",
        height: "64px",
        width: "64px",
        [theme.breakpoints.up("md")]: {
            height: "112px",
            width: "112px",
        },
        '&:hover': {
            backgroundColor: theme.palette.primary.main,
        }
    },
    icon: {
        color: theme.palette.background.default,
        height: "32px",
        width: "32px",
        [theme.breakpoints.up("md")]: {
            height: "54px",
            width: "54px",
        },
    },
    content: {
        marginTop: "15px"
    }
});