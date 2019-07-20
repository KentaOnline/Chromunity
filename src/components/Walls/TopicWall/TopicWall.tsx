import React from 'react';
import { Topic } from '../../../types';
import { getTopicsPriorToTimestamp, getTopicsAfterTimestamp, getTopicsFromFollowsPriorToTimestamp, getTopicsFromFollowsAfterTimestamp, getTopicsFromFollowedTagsPriorToTimestamp } from '../../../blockchain/TopicService';
import { LinearProgress, Container } from '@material-ui/core';
import TopicOverviewCard from '../../Topic/TopicOverViewCard/TopicOverviewCard';
import { NewTopicButton } from '../../buttons/NewTopicButton';
import { getUser } from '../../../util/user-util';
import LoadMoreButton from '../../buttons/LoadMoreButton';

interface Props {
    type: string;
}

interface State {
    topics: Topic[];
    isLoading: boolean;
    couldExistOlderTopics: boolean;
}

const topicsPageSize: number = 25;

class TopicWall extends React.Component<Props, State> {
    constructor(props: any) {
        super(props);
        this.state = {
            topics: [],
            isLoading: true,
            couldExistOlderTopics: false
        };

        this.retrieveLatestTopics = this.retrieveLatestTopics.bind(this);
        this.retrieveOlderTopics = this.retrieveOlderTopics.bind(this);
    }

    renderLoadMoreButton() {
        if (this.state.couldExistOlderTopics) {
            return (<LoadMoreButton onClick={this.retrieveOlderTopics} />)
        }
    }

    render() {
        return (
            <div>
                <Container fixed maxWidth='md'>
                    <div className='topic-wall-container'>
                        <br />
                        {this.state.isLoading ? <LinearProgress variant="query" /> : <div></div>}
                        {this.state.topics.map(topic => <TopicOverviewCard key={'card-' + topic.id} topic={topic} />)}
                    </div>
                    {this.renderLoadMoreButton()}
                </Container>
                {getUser() != null ? <NewTopicButton updateFunction={this.retrieveLatestTopics} /> : <div></div>}
            </div>
        );
    }

    componentDidMount() {
        this.retrieveLatestTopics();
    }

    retrieveLatestTopicsForAll() {
        var topics: Promise<Topic[]>;

        if (this.state.topics.length === 0) {
            topics = getTopicsPriorToTimestamp(Date.now(), topicsPageSize);
        } else {
            topics = getTopicsAfterTimestamp(this.state.topics[0].timestamp, topicsPageSize);
        }

        topics.then(retrievedTopics => {
            if (retrievedTopics.length > 0) {
                this.setState(prevState => ({
                    topics: Array.from(new Set(retrievedTopics.concat(prevState.topics))),
                    isLoading: false,
                    couldExistOlderTopics: retrievedTopics.length >= topicsPageSize
                }));
            } else {
                this.setState({ isLoading: false, couldExistOlderTopics: false });
            }
        })
    }

    retrieveLatestTopicsForUserFollowings() {
        var topics: Promise<Topic[]>;

        if (this.state.topics.length === 0) {
            topics = getTopicsFromFollowsPriorToTimestamp(getUser(), Date.now(), topicsPageSize);
        } else {
            topics = getTopicsFromFollowsAfterTimestamp(getUser(), this.state.topics[0].timestamp, topicsPageSize);
        }

        topics.then(retrievedTopics => {
            if (retrievedTopics.length > 0) {
                this.setState(prevState => ({
                    topics: Array.from(new Set(retrievedTopics.concat(prevState.topics))),
                    isLoading: false,
                    couldExistOlderTopics: retrievedTopics.length >= topicsPageSize
                }));
            } else {
                this.setState({ isLoading: false, couldExistOlderTopics: false });
            }
        }).catch(() => this.setState({ isLoading: false, couldExistOlderTopics: false }));
    }

    retrieveLatestTopicsForTagFollowings() {
        var topics: Promise<Topic[]>;

        if (this.state.topics.length === 0) {
            topics = getTopicsFromFollowedTagsPriorToTimestamp(getUser(), Date.now(), topicsPageSize);
        } else {
            topics = getTopicsFromFollowedTagsPriorToTimestamp(getUser(), this.state.topics[0].timestamp, topicsPageSize);
        }

        topics.then(retrievedTopics => {
            if (retrievedTopics.length > 0) {
                this.setState(prevState => ({
                    topics: Array.from(new Set(retrievedTopics.concat(prevState.topics))),
                    isLoading: false,
                    couldExistOlderTopics: retrievedTopics.length >= topicsPageSize
                }));
            } else {
                this.setState({ isLoading: false, couldExistOlderTopics: false });
            }
        }).catch(() => this.setState({ isLoading: false, couldExistOlderTopics: false }));
    }

    retrieveLatestTopics() {
        this.setState({ isLoading: true });

        if (this.props.type === "userFollowings") {
            this.retrieveLatestTopicsForUserFollowings();
        } else if (this.props.type === "tagFollowings") {
            this.retrieveLatestTopicsForTagFollowings();
        } else {
            this.retrieveLatestTopicsForAll();
        }
    }

    retrieveOlderTopicsForUserFollowings(oldestTimestamp: number) {
        getTopicsFromFollowsPriorToTimestamp(getUser(), oldestTimestamp, topicsPageSize)
            .then(retrievedTopics => {
                if (retrievedTopics.length > 0) {
                    this.setState(prevState => ({
                        topics: Array.from(new Set(prevState.topics.concat(retrievedTopics))),
                        isLoading: false,
                        couldExistOlderTopics: retrievedTopics.length >= topicsPageSize
                    }));
                } else {
                    this.setState({ isLoading: false, couldExistOlderTopics: false });
                }
            }).catch(() => this.setState({ isLoading: false, couldExistOlderTopics: false }));
    }

    retrieveOlderTopicsForTagFollowings(oldestTimestamp: number) {
        getTopicsFromFollowedTagsPriorToTimestamp(getUser(), oldestTimestamp, topicsPageSize)
            .then(retrievedTopics => {
                if (retrievedTopics.length > 0) {
                    this.setState(prevState => ({
                        topics: Array.from(new Set(prevState.topics.concat(retrievedTopics))),
                        isLoading: false,
                        couldExistOlderTopics: retrievedTopics.length >= topicsPageSize
                    }));
                } else {
                    this.setState({ isLoading: false, couldExistOlderTopics: false });
                }
            }).catch(() => this.setState({ isLoading: false, couldExistOlderTopics: false }));
    }

    retrieveOlderTopicsForAll(oldestTimestamp: number) {
        getTopicsPriorToTimestamp(oldestTimestamp, topicsPageSize)
                .then(retrievedTopics => {
                    if (retrievedTopics.length > 0) {
                        this.setState(prevState => ({
                            topics: Array.from(new Set(prevState.topics.concat(retrievedTopics))),
                            isLoading: false,
                            couldExistOlderTopics: retrievedTopics.length >= topicsPageSize
                        }));
                    } else {
                        this.setState({ isLoading: false, couldExistOlderTopics: false });
                    }
                });
    }

    retrieveOlderTopics() {
        if (this.state.topics.length > 0) {
            this.setState({ isLoading: true });
            const oldestTimestamp: number = this.state.topics[this.state.topics.length - 1].timestamp;

            if (this.props.type === "userFollowings") {
                this.retrieveOlderTopicsForUserFollowings(oldestTimestamp);
            } else if (this.props.type === "tagFollowings") {
                this.retrieveOlderTopicsForTagFollowings(oldestTimestamp);
            } else {
                this.retrieveOlderTopicsForAll(oldestTimestamp);
            }
        }
    }
}

export default TopicWall;
