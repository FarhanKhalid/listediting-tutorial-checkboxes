
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Header, Title, Content, Text,
    Button, Icon, Left, Right, Body, Badge,
    List, ListItem, Fab, IconNB, CheckBox, Footer, FooterTab, Input,
    Segment
} from 'native-base';
import { Modal, TouchableHighlight, TouchableWithoutFeedback, Animated, Image, 
    View, ListView, RefreshControl, Alert } from 'react-native';

import styles from './styles/styles';

var taskArray = [];
var currentUserId = 0;

class App extends React.Component {
    constructor(props) {
        super(props);

        var dataSource = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1.Id != r2.Id });
        this.state = {
            tasks: taskArray,
            taskCheckedStatus: false,
            dataSource: dataSource.cloneWithRows(taskArray),
            isLoading: true,
            refreshing: false,
            toggleMode: false,
            checkBoxAnimation: new Animated.Value(-50),
            checkBoxAnimation2: new Animated.Value(30),
            segmentAnimation: new Animated.Value(0),
            segmentAnimation2: new Animated.Value(0)
        }
    }

    componentDidMount() {
        this.getTaskList();
    }

    findTaskIndex(taskId) {
        let { tasks } = this.state;
        for (var i = 0; i < tasks.length; i++) {
            if (tasks[i].Id === taskId) {
                return i;
            }
        }

        return -1;
    }

    async getTaskList() {
        try {
          this.getTheData(function (json) {
              taskArray = json.Tasks;
              taskArray = taskArray.map((data) => {
                  var o = Object.assign({}, data);
                  o.isChecked = false;
                  return o;
              });
              this.setState({
                  tasks: taskArray,
                  dataSource: this.state.dataSource.cloneWithRows(taskArray),
                  isLoading: false,
                  refreshing: false
              })
          }.bind(this));
            
        } catch (error) {
            console.log("There was an error getting the tasks");
        }
    }

    getTheData(callback) {
        // example usage of props when passing data!
        var url = "http://localhost:8086/ws2/projects/taskssample";
        fetch(url).then(response => response.json())
            .then(json => callback(json))
            .catch(error => console.log(error));
    }

    toggleWorkflowSelection() {
        this.setState({
            showWorkflowModal: !this.state.showWorkflowModal
        })
    }

    toggleEditMode() {
        if (!this.state.toggleMode) {
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(this.state.checkBoxAnimation, { toValue: 0, duration: 300 }),
                    Animated.timing(this.state.checkBoxAnimation2, { toValue: 0, duration: 300 }),
                    Animated.timing(this.state.segmentAnimation, { toValue: 45, duration: 300 }),
                    Animated.timing(this.state.segmentAnimation2, { toValue: 1, duration: 300 })
                ])
            ]).start();
        } else {
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(this.state.checkBoxAnimation, { toValue: -50, duration: 300 }),
                    Animated.timing(this.state.checkBoxAnimation2, { toValue: 30, duration: 300 }),
                    Animated.timing(this.state.segmentAnimation, { toValue: 0, duration: 300 }),
                    Animated.timing(this.state.segmentAnimation2, { toValue: 0, duration: 300 })
                ])
            ]).start();
        }

        this.state.toggleMode = !this.state.toggleMode;
    }

    toggleCheckForTask(taskId) {
        var foundIndex = this.findTaskIndex(taskId);
        var newTasks = this.state.tasks;
        newTasks[foundIndex].isChecked = !newTasks[foundIndex].isChecked;

        var newDataSource = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1.Id != r2.Id });

        this.setState({
            tasks: newTasks,
            dataSource: newDataSource.cloneWithRows(newTasks)
        });
    }

    deleteTasks() {
        // Todo: delete tasks at this point
    }

    confirmTaskDeletion() {
        Alert.alert(
            'Delete tasks?',
            'Are you sure you want to delete your selected tasks?',
            [
                {text: 'Confirm', onPress: () => this.deleteTasks()},
                {text: 'Cancel', style: 'cancel'}
            ],
            { cancelable: true }
        )
    }

    renderRow(rowData, sectionId, rowId) {
        let { checkBoxAnimation } = this.state;
        let { checkBoxAnimation2 } = this.state;
        return (
            <ListItem>
                <Animated.View style={{ ...this.props.style, marginLeft: checkBoxAnimation, marginRight: checkBoxAnimation2 }}>
                    <CheckBox color={'#000'} checked={rowData.isChecked} onPress={() => this.toggleCheckForTask(rowData.Id)} />
                </Animated.View>
                <Body>
                    <Text>{rowData.Description}</Text>
                    <View>
                        <Text style={styles.taskDate}>{rowData.CreatedOn}</Text>
                    </View>
                </Body>

                <Right>
                    <Text style={styles.taskEffort}>{rowData.Effort}</Text>
                </Right>
            </ListItem>
        );
    }

    render() {
        let currentView = <View />;
        if (this.state.isLoading) {
            currentView = <View />;
        } else {
            currentView = <ListView style={styles.taskListView}
                dataSource={this.state.dataSource} renderRow={this.renderRow.bind(this)}
                enableEmptySections={true}
            />;
        }

        let { segmentAnimation, segmentAnimation2 } = this.state;

        return (
            <Container style={styles.container}>
                <Header>
                    <Left>
                        </Left>
                    <Body>
                        <Title>My tasks</Title>
                    </Body>
                    <Right>
                        <Button transparent onPress={() => this.toggleEditMode()}>
                            <Text>Edit</Text>
                        </Button>
                    </Right>
                </Header>
                <Animated.View style={{ ...this.props.style, height: segmentAnimation, opacity: segmentAnimation2 }}>
                    <Segment>
                        <Button onPress={() => this.confirmTaskDeletion()} style={{ borderColor: 'transparent' }}><Text>Delete</Text></Button>
                    </Segment>
                </Animated.View>

                <Content refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this._onRefresh.bind(this)} />}>
                    {currentView}
                </Content>
            </Container>
        );
    }
}


export default App;
