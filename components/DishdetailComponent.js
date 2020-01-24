import React, { Component } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  Button,
  Modal,
  Alert,
  PanResponder,
  Share
} from "react-native";
import { Card, Icon, Rating, Input } from "react-native-elements";
import { connect } from "react-redux";
import { baseUrl } from "../shared/baseUrl";
import { postFavorite, postComment } from "../redux/ActionCreators";
import * as Animatable from "react-native-animatable";

const mapStateToProps = state => {
  return {
    dishes: state.dishes,
    comments: state.comments,
    favorites: state.favorites
  };
};

const mapDispatchToProps = dispatch => ({
  postFavorite: dishId => dispatch(postFavorite(dishId)),
  postComment: (dishId, rating, author, comment) =>
    dispatch(postComment(dishId, rating, author, comment))
});

function RenderDish(props) {
  const dish = props.dish;

  handleViewRef = ref => (this.view = ref);
  const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
    // MoveX is the latest screen coordinates of the recently moved touch gesture and similarly moveY
    //is the screen coordinates of the recently moved touch.
    // dx is the accumulated distance of the gesture since the touch started along the X direction

    //the way the distances are measured is with 00 at the top-left corner
    if (dx < -200) return true;
    else return false;
  };
  const recognizeDragLeft = ({ moveX, moveY, dx, dy }) => {
    // console.log(dx);
    if (dx > 200) return true;
    else return false;
  };
  const panResponder = PanResponder.create({
    // 2 parameters: event and gesture -> that contain information about the user gesture
    onStartShouldSetPanResponder: (e, gestureState) => {
      return true;
    },
    onPanResponderGrant: () => {
      this.view
        .rubberBand(1000)
        .then(endState =>
          console.log(endState.finished ? "Finished" : "Cancelled")
        );
    },
    onPanResponderEnd: (e, gestureState) => {
      console.log("pan responder end", gestureState);
      if (recognizeDrag(gestureState)) {
        Alert.alert(
          "Add to Favorite?",
          "Are you sure you wish to add " + dish.name + " to your favorites?",
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel pressed"),
              style: "cancel"
            },
            {
              text: "OK",
              onPress: () =>
                props.favorite
                  ? console.log("Already favorite")
                  : props.onPress()
            }
          ],
          { cancelable: false }
        );
        return true;
      } else if (recognizeDragLeft(gestureState)) props.toggleModal();
      return true;
    }
  });

  const shareDish = (title, message, url) => {
    Share.share(
      {
        title: title,
        message: title + ": " + message + " " + url,
        url: url
      },
      {
        dialogTitle: "Share " + title
      }
    );
  };

  if (dish != null) {
    return (
      <Animatable.View
        animation="fadeInDown"
        duration={2000}
        delay={1000}
        ref={this.handleViewRef}
        {...panResponder.panHandlers}
      >
        <Card featuredTitle={dish.name} image={{ uri: baseUrl + dish.image }}>
          <Text style={{ margin: 10 }}>{dish.description}</Text>
          <View style={styles.iconRow}>
            <Icon
              raised
              reverse
              name={props.favorite ? "heart" : "heart-o"}
              type="font-awesome"
              color="#f50"
              onPress={() =>
                props.favorite
                  ? console.log("Already favorite")
                  : props.onPress()
              }
            />
            <Icon
              raised
              reverse
              name="pencil"
              type="font-awesome"
              color="#512DA8"
              onPress={() => props.toggleModal()}
            />
            <Icon
              raised
              reverse
              name="share"
              type="font-awesome"
              color="#51D2A8"
              style={styles.cardItem}
              onPress={() =>
                shareDish(dish.name, dish.description, baseUrl + dish.image)
              }
            />
          </View>
        </Card>
      </Animatable.View>
    );
  } else {
    return <View></View>;
  }
}

function RenderComments(props) {
  const comments = props.comments;

  const renderCommentItem = ({ item, index }) => {
    return (
      <View key={index} style={{ margin: 10 }}>
        <Text style={{ fontSize: 14 }}>{item.comment}</Text>
        <Rating
          imageSize={15}
          readonly
          startingValue={item.rating}
          style={{ alignItems: "flex-start" }}
          onFinishRating={rating => this.setState({ rating: rating })}
        />
        <Text style={{ fontSize: 12 }}>
          {"-- " + item.author + ", " + item.date}
        </Text>
      </View>
    );
  };
  return (
    <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
      <Card title="Comments">
        <FlatList
          data={comments}
          renderItem={renderCommentItem}
          keyExtractor={item => item.id.toString()}
        />
      </Card>
    </Animatable.View>
  );
}

class Dishdetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rating: 0,
      author: "",
      comment: "",
      showModal: false
    };
  }
  toggleModal() {
    this.setState({ showModal: !this.state.showModal });
  }
  handleComment(dishId) {
    this.props.postComment(
      dishId,
      this.state.rating,
      this.state.author,
      this.state.comment
    );
    this.toggleModal();
  }

  resetForm() {
    this.setState({
      rating: 0,
      author: "",
      comment: "",
      showModal: false
    });
  }

  markFavorite(dishId) {
    this.props.postFavorite(dishId);
  }
  static navigationOptions = {
    title: "Dish Details"
  };

  render() {
    const dishId = this.props.navigation.getParam("dishId", "");
    return (
      <ScrollView>
        <RenderDish
          dish={this.props.dishes.dishes[+dishId]}
          favorite={this.props.favorites.some(el => el === dishId)}
          onPress={() => this.markFavorite(dishId)}
          toggleModal={() => this.toggleModal()}
        />
        <RenderComments
          comments={this.props.comments.comments.filter(
            comment => comment.dishId === dishId
          )}
        />
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.showModal}
          onDismiss={() => {
            this.toggleModal();
            this.resetForm();
          }}
          onRequestClose={() => {
            this.toggleModal();
            this.resetForm();
          }}
        >
          <View style={styles.modal}>
            <Rating
              showRating
              fractions={0}
              onFinishRating={value => this.setState({ rating: value })}
              style={{ paddingVertical: 10 }}
            />
            <Input
              placeholder="Author"
              leftIcon={{ type: "font-awesome", name: "user-o" }}
              onChangeText={text => this.setState({ author: text })}
              value={this.state.author}
            />
            <Input
              placeholder="Comment"
              leftIcon={{ type: "font-awesome", name: "comment-o" }}
              onChangeText={text => this.setState({ comment: text })}
              value={this.state.comment}
            />
            <Button
              onPress={() => {
                this.handleComment(dishId);
                this.resetForm();
              }}
              color="#512DA8"
              title="Submit"
            />
            <Button
              onPress={() => {
                this.resetForm();
              }}
              color="#808080"
              title="Cancel"
            />
          </View>
        </Modal>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  iconRow: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    flexDirection: "row",
    margin: 20
  },
  modal: {
    justifyContent: "center",
    margin: 35
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    backgroundColor: "#512DA8",
    textAlign: "center",
    color: "white",
    marginBottom: 20
  },
  modalText: {
    fontSize: 18,
    margin: 10
  },
  buttonCancel: {
    backgroundColor: "grey",
    fontSize: 30,
    color: "black"
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Dishdetail);
