import { getANumber } from './helper';
import * as bip39 from 'bip39';
import { User, Topic, TopicReply } from '../src/types';
import { register, login } from '../src/blockchain/UserService';
import { createTopic, getTopicsByUserPriorToTimestamp, giveTopicStarRating, getTopicStarRaters, removeTopicStarRating, getTopicsAfterTimestamp, getTopicsPriorToTimestamp, getTopicById, createTopicReply, getTopicReplies, giveReplyStarRating, getReplyStarRaters, removeReplyStarRating } from '../src/blockchain/TopicService';

jest.setTimeout(30000);

describe("topic tests", () => {

    const user = {
        name: 'viktor_' + getANumber(),
        password: 'userPSW1',
        mnemonic: bip39.generateMnemonic(160)
    };

    var userLoggedIn: User;
    var topic: Topic;

    it('register user ' + user.name, async () => {
        await register(user.name, user.password, user.mnemonic);
    });

    it('login user for creating topics', async () => {
        userLoggedIn = await login(user.name, user.password, user.mnemonic);
        expect(userLoggedIn.name).toBe(user.name);
    });

    it('create topic', async () => {
        await createTopic(userLoggedIn, 'First topic', 'Sweet topic you got there!');
        await createTopic(userLoggedIn, 'Second topic', 'Not as good as the first one...');
        const topics: Topic[] = await getTopicsByUserPriorToTimestamp(userLoggedIn.name, Date.now());
        expect(topics.length).toBeGreaterThanOrEqual(2);
        topic = topics[0];
    });

    it("reply to topic", async() => {
        await createTopicReply(userLoggedIn, topic.id, "I completely agree!");
        
        const replies: TopicReply[] = await getTopicReplies(topic.id);
        expect(replies.length).toBe(1);
        const reply: TopicReply = replies[0];

        await giveReplyStarRating(userLoggedIn, reply.id);
        const upvotedBy: string[] = await getReplyStarRaters(reply.id);
        expect(upvotedBy.length).toBe(1);

        await removeReplyStarRating(userLoggedIn, reply.id);
        const upvotedBy2: string[] = await getReplyStarRaters(reply.id);
        expect(upvotedBy2.length).toBe(0);

        await giveReplyStarRating(userLoggedIn, reply.id);
        const upvotedBy3: string[] = await getReplyStarRaters(reply.id);
        expect(upvotedBy3.length).toBe(1);
    });

    it("star rate topic", async () => {
        await giveTopicStarRating(userLoggedIn, topic.id);
        const usersWhoRated: string[] = await getTopicStarRaters(topic.id);
        expect(usersWhoRated.length).toBe(1);
    });

    it("remove star rate on topic", async () => {
        await removeTopicStarRating(userLoggedIn, topic.id);
        const usersWhoRated: string[] = await getTopicStarRaters(topic.id);
        expect(usersWhoRated.length).toBe(0);
    });

    it("star rate topic again", async () => {
        await giveTopicStarRating(userLoggedIn, topic.id);
        const usersWhoRated: string[] = await getTopicStarRaters(topic.id);
        expect(usersWhoRated.length).toBe(1);
    });

    it("get topic after timestamp", async () => {
        const title: string = "It is fun to program in Rell"
        const message: string = "It is fun to program in Rell. It is a great language to interact with a blockchain.";
        await createTopic(userLoggedIn, title, message);
        const topics: Topic[] = await getTopicsAfterTimestamp(Date.now() - 30000);
        expect(topics.length).toBeGreaterThan(0);
    });

    it("get topic prior to timestamp", async () => {
        const title: string = "Blockchain has never been easier";
        const message: string = "Rell makes using a blockchain so easy";
        await createTopic(userLoggedIn, title, message);
        const topics: Topic[] = await getTopicsPriorToTimestamp(Date.now());
        expect(topics.length).toBeGreaterThan(0);
    });

    it("get topic by id", async () => {
        const fetchedTopic: Topic = await getTopicById(topic.id);
        expect(topic.message).toBe(fetchedTopic.message);
    });

})