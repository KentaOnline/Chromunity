import { CREATE_LOGGED_IN_USER } from "../../../shared/test-utility/users";
import { CREATE_RANDOM_TOPIC } from "../../../shared/test-utility/topics";
import {
  WallActionTypes,
  WallType,
  IUpdateTopics
} from "./wallTypes";
import { runSaga } from "redux-saga";
import { loadAllTopicsSaga, loadAllTopicsByPopularitySaga, loadOlderAllTopicsSaga } from "./wallSagas";
import { ChromunityUser, Topic } from "../../../types";
import { getANumber } from "../../../shared/test-utility/helper";
import { Action } from "redux";

describe("Topic wall [ALL] saga tests", () => {
  const pageSize = 2;
  jest.setTimeout(30000);

  let user: ChromunityUser;

  function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  beforeAll(async () => {
    const channel = "all";
    user = await CREATE_LOGGED_IN_USER();

    await Array.from({ length: pageSize }).forEach(async () => {
      await CREATE_RANDOM_TOPIC(user, channel);
    });

    await sleep(5000);
  });

  const createFakeStore = (dispatchedActions: any[], state: any) => {
    return {
      dispatch: (action: any) => dispatchedActions.push(action),
      getState: () => ({ topicWall: state })
    };
  };

  const getUpdateTopicAction = (dispatchedActions: any[]): IUpdateTopics => {
    for (const action of dispatchedActions) {
      if (action.type === WallActionTypes.UPDATE_TOPICS_WALL) return action.payload;
    }
    return null;
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
        latest_poster: "",
        moderated_by: []
      }
    ];
  };

  const getUpdateTopicsFromCacheAction = (dispatchedActions: any[]): WallType => {
    for (const action of dispatchedActions) {
      if (action.type === WallActionTypes.UPDATE_TOPICS_WALL_FROM_CACHE) return action.payload;
    }
    return null;
  };

  beforeEach(async () => {
    user = await CREATE_LOGGED_IN_USER();
  });

  it("load all topics wall", async () => {
    const dispatchedActions: any[] = [];
    const fakeStore = createFakeStore(dispatchedActions, { wallType: WallType.ALL, all: { topics: [], updated: 0 } });

    await runSaga(fakeStore, loadAllTopicsSaga, {
      type: WallActionTypes.LOAD_ALL_TOPIC_WALL,
      payload: {
        pageSize: pageSize,
        ignoreCache: false
      }
    } as Action).toPromise();
    const updateTopicsAction = getUpdateTopicAction(dispatchedActions);

    expect(updateTopicsAction.topics.length).toBe(pageSize);
    expect(updateTopicsAction.couldExistOlder).toBe(true);
    expect(updateTopicsAction.wallType).toBe(WallType.ALL);
  });

  it("load all topics wall | returns less than page size", async () => {
    const dispatchedActions: any[] = [];
    const fakeStore = createFakeStore(dispatchedActions, { wallType: WallType.NONE, all: { topics: [], updated: 0 } });

    await runSaga(fakeStore, loadAllTopicsSaga, {
      type: WallActionTypes.LOAD_ALL_TOPIC_WALL,
      payload: {
        pageSize: 1000,
        ignoreCache: false
      }
    } as Action).toPromise();
    const updateTopicsAction = getUpdateTopicAction(dispatchedActions);

    expect(updateTopicsAction.couldExistOlder).toBe(false);
    expect(updateTopicsAction.wallType).toBe(WallType.ALL);
  });

  it("load all topics wall | topic already loaded", async () => {
    const dispatchedActions: any[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      wallType: WallType.ALL,
      all: { topics: createFakeTopics(0), updated: 0, couldExistOlder: true }
    });

    await runSaga(fakeStore, loadAllTopicsSaga, {
      type: WallActionTypes.LOAD_ALL_TOPIC_WALL,
      payload: {
        pageSize: pageSize,
        ignoreCache: false
      }
    } as Action).toPromise();
    const updateTopicsAction: IUpdateTopics = getUpdateTopicAction(dispatchedActions);

    expect(updateTopicsAction.topics.length).toBe(pageSize + 1);
    expect(updateTopicsAction.couldExistOlder).toBe(true);
    expect(updateTopicsAction.wallType).toBe(WallType.ALL);
  });

  it("load all topics wall | from cache", async () => {
    const dispatchedActions: any[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      all: {
        topics: createFakeTopics(Date.now()),
        updated: Date.now()
      }
    });

    await runSaga(fakeStore, loadAllTopicsSaga, {
      type: WallActionTypes.LOAD_ALL_TOPIC_WALL,
      payload: {
        pageSize: pageSize,
        ignoreCache: false
      }
    } as Action).toPromise();

    const action = getUpdateTopicsFromCacheAction(dispatchedActions);
    expect(action).toBe(WallType.ALL);
  });

  it("load older all topics", async () => {
    const dispatchedActions: any[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      all: {
        topics: createFakeTopics(Date.now()),
        updated: 0
      },
      wallType: WallType.ALL
    });

    await runSaga(fakeStore, loadOlderAllTopicsSaga, {
      type: WallActionTypes.LOAD_OLDER_ALL_TOPICS,
      payload: pageSize
    } as Action).toPromise();
    const updateTopicsAction: IUpdateTopics = getUpdateTopicAction(dispatchedActions);

    expect(updateTopicsAction.topics.length).toBe(pageSize + 1);
    expect(updateTopicsAction.couldExistOlder).toBe(true);
    expect(updateTopicsAction.wallType).toBe(WallType.ALL);
  });

  it("load older all topics | no older exists", async () => {
    const dispatchedActions: any[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      all: {
        topics: createFakeTopics(0),
        updated: 0
      },
      wallType: WallType.ALL
    });

    await runSaga(fakeStore, loadOlderAllTopicsSaga, {
      type: WallActionTypes.LOAD_OLDER_ALL_TOPICS,
      payload: pageSize
    } as Action).toPromise();
    const updateTopicsAction: IUpdateTopics = getUpdateTopicAction(dispatchedActions);

    expect(updateTopicsAction.topics.length).toBe(1);
    expect(updateTopicsAction.couldExistOlder).toBe(false);
    expect(updateTopicsAction.wallType).toBe(WallType.ALL);
  });

  it("load older all topics | no previous topics loaded", async () => {
    const dispatchedActions: any[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      all: {
        topics: [],
        updated: 0
      },
      wallType: WallType.ALL
    });

    await runSaga(fakeStore, loadOlderAllTopicsSaga, {
      type: WallActionTypes.LOAD_OLDER_ALL_TOPICS,
      payload: pageSize
    } as Action).toPromise();
    const updateTopicsAction: IUpdateTopics = getUpdateTopicAction(dispatchedActions);

    expect(updateTopicsAction.topics.length).toBe(pageSize);
    expect(updateTopicsAction.couldExistOlder).toBe(true);
    expect(updateTopicsAction.wallType).toBe(WallType.ALL);
  });

  it("load all topics by popularity", async () => {
    const dispatchedActions: any[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      all: {
        topics: [],
        updated: 0
      },
      wallType: WallType.ALL
    });

    await runSaga(fakeStore, loadAllTopicsByPopularitySaga, {
      type: WallActionTypes.LOAD_ALL_TOPICS_BY_POPULARITY,
      payload: {
        timestamp: 0,
        pageSize: pageSize
      }
    } as Action).toPromise();

    const updateTopicsAction: IUpdateTopics = getUpdateTopicAction(dispatchedActions);
    expect(updateTopicsAction.topics.length).toBe(pageSize);
    expect(updateTopicsAction.couldExistOlder).toBe(false);
    expect(updateTopicsAction.wallType).toBe(WallType.NONE);
  });
});
