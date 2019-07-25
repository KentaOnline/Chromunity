import { register, login } from "../src/blockchain/UserService";
import { triggerElection, signUpForElection, getUncompletedElection, completeElection, voteForCandidate, getElectionCandidates, getElectionVoteForUser, getElectionVotes } from "../src/blockchain/ElectionService";
import { getANumber, sleepUntil } from "./helper";


import * as bip39 from "bip39";
import { User, Election, Topic, TopicReply } from "../src/types";
import { isRepresentative, setUser } from "../src/util/user-util";
import { getRepresentatives, getCurrentRepresentativePeriod } from "../src/blockchain/RepresentativesService";
import { createTopic, getTopicsByUserPriorToTimestamp, removeTopic, getTopicById, createTopicReply, getTopicRepliesPriorToTimestamp, removeTopicReply } from "../src/blockchain/TopicService";

jest.setTimeout(30000);

describe("election test", () => {

    const admin = {
        name: "admin",
        password: "admin",
        mnemonic: "rule comfort scheme march fresh defy radio width crash family toward index"
    }

    var adminUser: User;

    it("register admin", async () => {
        await expect(register(admin.name, admin.password, admin.mnemonic)).resolves.toBe(null);
        console.log("Registered", admin.name, " with mnemonic", admin.mnemonic);
    });

    it("login admin", async () => {
        adminUser = await login(admin.name, admin.password, admin.mnemonic);
        console.log("Logged in", adminUser);

        expect(adminUser).toBeDefined();
        expect(adminUser.name).toBe(admin.name);
        expect(adminUser.seed).toBeDefined();
    });

    it("hold election", async () => {
        const electionTimestamp = Date.now() + 10000;
        await triggerElection(adminUser, electionTimestamp);
        const electionId: string = await getUncompletedElection();
        expect(electionId).toBeDefined();

        await signUpForElection(adminUser, electionId);
        await voteForCandidate(adminUser, adminUser.name, electionId);

        const candidates: string[] = await getElectionCandidates(electionId);
        expect(candidates).toContain(adminUser.name);

        const sortedCandidatesByVote: string[] = await getElectionVotes(electionId);
        sleepUntil(electionTimestamp); // Sleep until election is over
        await completeElection(adminUser, electionId, sortedCandidatesByVote);

        const votedFor: string = await getElectionVoteForUser(adminUser.name, electionId);
        expect(votedFor).toBe(adminUser.name);

        const representatives: string[] = await getRepresentatives(electionId);
        const election: Election = await getCurrentRepresentativePeriod();

        expect(election.id).toBe(electionId);
        expect(representatives).toContain(adminUser.name);
    })

    it("as a representative remove topic and replies", async() => {
        const title: string = "This post should be removed";
        const message: string = "This post should be #removed, if not the #test is broken";
        await createTopic(adminUser, title, message);

        var topics: Topic[] = await getTopicsByUserPriorToTimestamp(adminUser.name, Date.now(), 10);
        const topicToBeRemoved: Topic = topics[0];

        await removeTopic(adminUser, topicToBeRemoved.id);
        const removedTopic: Topic = await getTopicById(topicToBeRemoved.id);
        expect(removedTopic.title).toBe("[Removed]");
        
        await createTopicReply(adminUser, removedTopic.id, "This should also be removed");
        var replies: TopicReply[] = await getTopicRepliesPriorToTimestamp(removedTopic.id, Date.now(), 10);

        await removeTopicReply(adminUser, replies[0].id);
        replies = await getTopicRepliesPriorToTimestamp(removedTopic.id, Date.now(), 10);
        expect(replies[0].message).toBe("Removed by @admin");
    });

});