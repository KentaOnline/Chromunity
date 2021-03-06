import { ChromunityUser, Topic, TopicReply } from "../../../src/types";
import { CREATE_LOGGED_IN_USER } from "../../users";
import { CREATE_RANDOM_TOPIC } from "../../topics";
import { createTopicReply, getTopicsByUserPriorToTimestamp } from "../../../src/blockchain/TopicService";
import {
  UpdateUserFollowedChannelsAction,
  UpdateUserRepliesAction,
  UpdateUserTopicsAction,
  UserPageActions,
  UserPageActionTypes
} from "../../../src/redux/UserTypes";
import { loadUserTopics, loadUserReplies, loadUserFollowedChannels } from "../../../src/redux/sagas/UserPageSagas";
import { runSaga } from "redux-saga";
import { getANumber } from "../../helper";
import { followChannel } from "../../../src/blockchain/ChannelService";

describe("User page saga tests", () => {
  const topicsTitle = "load user topics";
  const repliesTitle = "load user replies";
  const channelsTitle = "load user channels";

  const pageSize = 25;
  const channel = "";

  const emptyTopics: Topic[] = [];
  const emptyReplies: TopicReply[] = [];

  jest.setTimeout(30000);

  let user: ChromunityUser;
  let secondUser: ChromunityUser;

  const createFakeStore = (dispatchedActions: UserPageActions[], state: any) => {
    return {
      dispatch: (action: UserPageActions) => dispatchedActions.push(action),
      getState: () => ({ userPage: state })
    };
  };

  const createFakeTopics = (timestamp: number): Topic[] => {
    return [
      {
        id: "id-" + getANumber(),
        author: "author",
        title: "title",
        message: "message",
        timestamp: timestamp,
        last_modified: timestamp,
        removed: false
      }
    ];
  };

  const createFakeReplies = (timestamp: number): TopicReply[] => {
    return [
      {
        id: "id-" + getANumber(),
        topic_id: "id-" + getANumber(),
        author: "author",
        message: "message",
        timestamp: timestamp,
        isSubReply: false,
        removed: false
      }
    ];
  };

  const getUpdateUserTopicsAction = (actions: UserPageActions[]): UpdateUserTopicsAction => {
    expect(actions.length).toBe(1);
    const action = actions[0];
    expect(action.type).toBe(UserPageActionTypes.UPDATE_USER_TOPICS);
    return action as UpdateUserTopicsAction;
  };

  const getUpdateUserRepliesAction = (actions: UserPageActions[]): UpdateUserRepliesAction => {
    expect(actions.length).toBe(1);
    const action = actions[0];
    expect(action.type).toBe(UserPageActionTypes.UPDATE_USER_REPLIES);
    return action as UpdateUserRepliesAction;
  };

  const getUpdateUserFollowedChannelsAction = (actions: UserPageActions[]): UpdateUserFollowedChannelsAction => {
    expect(actions.length).toBe(1);
    const action = actions[0];
    expect(action.type).toBe(UserPageActionTypes.UPDATE_USER_FOLLOWED_CHANNELS);
    return action as UpdateUserFollowedChannelsAction;
  };

  beforeAll(async () => {
    user = await CREATE_LOGGED_IN_USER();
    secondUser = await CREATE_LOGGED_IN_USER();

    await CREATE_RANDOM_TOPIC(user, channel);
    const topics: Topic[] = await getTopicsByUserPriorToTimestamp(user.name, Date.now(), 1);
    const topic: Topic = topics[0];

    await createTopicReply(secondUser, topic.id, "A test reply..");
    await followChannel(secondUser, channel);
  });

  it(topicsTitle, async () => {
    const actions: UserPageActions[] = [];
    const fakeStore = createFakeStore(actions, { username: user.name, topics: emptyTopics });

    await runSaga(fakeStore, loadUserTopics, {
      type: UserPageActionTypes.LOAD_USER_TOPICS,
      pageSize: pageSize
    }).toPromise();
    const updateUserTopicsAction = getUpdateUserTopicsAction(actions);

    expect(updateUserTopicsAction.topics.length).toBe(1);
    expect(updateUserTopicsAction.couldExistOlderTopics).toBe(false);
  });

  it(topicsTitle + " | none exists", async () => {
    const actions: UserPageActions[] = [];
    const fakeStore = createFakeStore(actions, { username: secondUser.name, topics: emptyTopics });

    await runSaga(fakeStore, loadUserTopics, {
      type: UserPageActionTypes.LOAD_USER_TOPICS,
      pageSize: pageSize
    }).toPromise();
    const updateUserTopicsAction = getUpdateUserTopicsAction(actions);

    expect(updateUserTopicsAction.topics.length).toBe(0);
    expect(updateUserTopicsAction.couldExistOlderTopics).toBe(false);
  });

  it(topicsTitle + " | pageSize returned", async () => {
    const actions: UserPageActions[] = [];
    const fakeStore = createFakeStore(actions, { username: user.name, topics: emptyTopics });

    await runSaga(fakeStore, loadUserTopics, {
      type: UserPageActionTypes.LOAD_USER_TOPICS,
      pageSize: 1
    }).toPromise();
    const updateUserTopicsAction = getUpdateUserTopicsAction(actions);

    expect(updateUserTopicsAction.topics.length).toBe(1);
    expect(updateUserTopicsAction.couldExistOlderTopics).toBe(true);
  });

  it(topicsTitle + " | older already loaded", async () => {
    const actions: UserPageActions[] = [];
    const fakeStore = createFakeStore(actions, { username: user.name, topics: createFakeTopics(Date.now()) });

    await runSaga(fakeStore, loadUserTopics, {
      type: UserPageActionTypes.LOAD_USER_TOPICS,
      pageSize: pageSize
    }).toPromise();
    const updateUserTopicsAction = getUpdateUserTopicsAction(actions);

    expect(updateUserTopicsAction.topics.length).toBe(2);
    expect(updateUserTopicsAction.couldExistOlderTopics).toBe(false);
  });

  it(repliesTitle, async () => {
    const actions: UserPageActions[] = [];
    const fakeStore = createFakeStore(actions, { username: secondUser.name, replies: emptyReplies });

    await runSaga(fakeStore, loadUserReplies, {
      type: UserPageActionTypes.LOAD_USER_REPLIES,
      pageSize: pageSize
    }).toPromise();
    const updateUserRepliesAction = getUpdateUserRepliesAction(actions);

    expect(updateUserRepliesAction.replies.length).toBe(1);
    expect(updateUserRepliesAction.couldExistOlderReplies).toBe(false);
  });

  it(repliesTitle + " | none exists", async () => {
    const actions: UserPageActions[] = [];
    const fakeStore = createFakeStore(actions, { username: user.name, replies: emptyReplies });

    await runSaga(fakeStore, loadUserReplies, {
      type: UserPageActionTypes.LOAD_USER_REPLIES,
      pageSize: pageSize
    }).toPromise();
    const updateUserRepliesAction = getUpdateUserRepliesAction(actions);

    expect(updateUserRepliesAction.replies.length).toBe(0);
    expect(updateUserRepliesAction.couldExistOlderReplies).toBe(false);
  });

  it(repliesTitle + " | pageSize returned", async () => {
    const actions: UserPageActions[] = [];
    const fakeStore = createFakeStore(actions, { username: secondUser.name, replies: emptyReplies });

    await runSaga(fakeStore, loadUserReplies, {
      type: UserPageActionTypes.LOAD_USER_REPLIES,
      pageSize: 1
    }).toPromise();
    const updateUserRepliesAction = getUpdateUserRepliesAction(actions);

    expect(updateUserRepliesAction.replies.length).toBe(1);
    expect(updateUserRepliesAction.couldExistOlderReplies).toBe(true);
  });

  it(repliesTitle + " | older already loaded", async () => {
    const actions: UserPageActions[] = [];
    const fakeStore = createFakeStore(actions, { username: secondUser.name, replies: createFakeReplies(Date.now()) });

    await runSaga(fakeStore, loadUserReplies, {
      type: UserPageActionTypes.LOAD_USER_REPLIES,
      pageSize: pageSize
    }).toPromise();
    const updateUserRepliesAction = getUpdateUserRepliesAction(actions);

    expect(updateUserRepliesAction.replies.length).toBe(2);
    expect(updateUserRepliesAction.couldExistOlderReplies).toBe(false);
  });

  it(channelsTitle, async () => {
    const actions: UserPageActions[] = [];
    const fakeStore = createFakeStore(actions, { username: secondUser.name });

    await runSaga(fakeStore, loadUserFollowedChannels, {
      type: UserPageActionTypes.LOAD_USER_FOLLOWED_CHANNELS
    }).toPromise();

    const updateUserFollowedChannelsAction = getUpdateUserFollowedChannelsAction(actions);

    expect(updateUserFollowedChannelsAction.channels.length).toBe(1);
  });

  it(channelsTitle + " | none returned", async () => {
    const actions: UserPageActions[] = [];
    const fakeStore = createFakeStore(actions, { username: user.name });

    await runSaga(fakeStore, loadUserFollowedChannels, {
      type: UserPageActionTypes.LOAD_USER_FOLLOWED_CHANNELS
    }).toPromise();

    const updateUserFollowedChannelsAction = getUpdateUserFollowedChannelsAction(actions);

    expect(updateUserFollowedChannelsAction.channels.length).toBe(0);
  });
});
