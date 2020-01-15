import React from "react";
import {
  Text,
  View,
  ScrollView,
  FlatList,
  Button,
  Modal,
  StyleSheet,
  Switch,
  Alert,
  PanResponder
} from "react-native";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import * as Animatable from "react-native-animatable";
import { Card, Rating, Input, Icon } from "react-native-elements";
import { connect } from "react-redux";
import { baseUrl } from "../shared/baseUrl";
import { postFavorite, postComment } from "../redux/ActionCreators";

const mapStateToProps = state => {
  return {
    dishes: state.dishes,
    comments: state.comments,
    favorites: state.favorites
  };
};

const mapDispatchToProps = dispatch => ({
  postFavorite: dishId => dispatch(postFavorite(dishId)),
  postComment: ({ dishId, rating, author, comment }) =>
    dispatch(postComment({ dishId, rating, author, comment }))
});

import { DISHES } from "../shared/dishes";
import { COMMENTS } from "../shared/comments";

const RenderComments = ({ comments }) => {
  const renderCommentItem = ({ item, index }) => {
    return (
      <View key={index} style={{ margin: 10 }}>
        <Text style={{ fontSize: 14 }}>{item.comment}</Text>
        <View style={{ flex: 1, alignItems: "flex-start", marginVertical: 10 }}>
          <Rating
            type="star"
            ratingCount={5}
            imageSize={10}
            readonly
            startingValue={item.rating}
          />
        </View>
        <Text style={{ fontSize: 12 }}>{item.rating} Stars</Text>
        <Text style={{ fontSize: 12 }}>
          {"-- " + item.author + ", " + item.date}{" "}
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
};

const RenderDish = ({ dish, favorite, onPress, addComment }) => {
  const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
    return dx < -200;
  };

  const recognizeDragLeftToRight = ({ moveX, moveY, dx, dy }) => {
    return dx > 200;
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (e, gestureState) => {
      return true;
    },
    onPanResponderGrant: () => {
      this.view
        .rubberBand(1000)
        .then(endState =>
          console.log(endState.finished ? "finished" : "cancelled")
        );
    },
    onPanResponderEnd: (e, gestureState) => {
      console.log("pan responder end", gestureState);
      if (recognizeDrag(gestureState))
        Alert.alert(
          "Add Favorite",
          "Are you sure you wish to add " + dish.name + " to favorite?",
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel"
            },
            {
              text: "OK",
              onPress: () => {
                props.favorite
                  ? console.log("Already favorite")
                  : props.onPress();
              }
            }
          ],
          { cancelable: false }
        );
      if (recognizeDragLeftToRight(gestureState)) {
        addComment();
      }

      return true;
    }
  });

  const handleViewRef = ref => (this.view = ref);

  if (dish) {
    return (
      <Animatable.View
        animation="fadeInDown"
        duration={2000}
        delay={1000}
        {...panResponder.panHandlers}
        ref={handleViewRef}
      >
        <Card featuredTitle={dish.name} image={{ uri: baseUrl + dish.image }}>
          <Text style={{ margin: 10 }}>{dish.description}</Text>
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <Icon
              raised
              reverse
              name={favorite ? "heart" : "heart-o"}
              type="font-awesome"
              color="#f50"
              onPress={() =>
                favorite ? console.log("Already favorite") : onPress()
              }
            />
            <Icon
              raised
              reverse
              name={"pencil"}
              type="font-awesome"
              color="#512da7"
              onPress={() => addComment()}
            />
          </View>
        </Card>
      </Animatable.View>
    );
  }

  return <View />;
};

class DishDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dishes: DISHES,
      comments: COMMENTS,
      favorites: [],
      showModal: false,
      rating: 5,
      author: "",
      comment: ""
    };
  }

  static navigationOptions = {
    title: "Dish Details"
  };

  markFavorite(dishId) {
    this.props.postFavorite(dishId);
  }

  openCommentForm() {
    this.setState({ showModal: true });
  }

  handleComment() {
    console.log(this.state);
    const { author, comment, rating } = this.state;
    this.props.postComment({
      dishId: this.getDishId(),
      author,
      comment,
      rating
    });
    this.resetCommentForm();
  }

  resetCommentForm() {
    this.setState({ author: "", comment: "", rating: 5 });
    this.closeCommentForm();
  }

  closeCommentForm() {
    this.setState({ showModal: false });
  }

  getDishId() {
    return this.props.navigation.getParam("dishId", "");
  }

  render() {
    const dishId = this.getDishId();

    return (
      <ScrollView>
        <RenderDish
          dish={this.props.dishes.dishes[+dishId]}
          favorite={this.props.favorites.some(el => el === dishId)}
          onPress={() => this.markFavorite(dishId)}
          addComment={() => this.openCommentForm()}
        />

        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.showModal}
        >
          <View style={styles.modal}>
            <Rating
              type="star"
              ratingCount={5}
              minValue={1}
              imageSize={30}
              startingValue={this.state.rating}
              showRating
              onFinishRating={rating => this.setState({ rating })}
            />
            <Input
              placeholder="Author"
              onChangeText={author => this.setState({ author })}
              value={this.state.author}
              leftIcon={<FontAwesomeIcon name="user" size={24} color="black" />}
            />
            <Input
              placeholder="Comment"
              onChangeText={comment => this.setState({ comment })}
              value={this.state.comment}
              leftIcon={
                <FontAwesomeIcon name="comment" size={24} color="black" />
              }
            />
            <View style={styles.modalButtonContainer}>
              <Button
                onPress={() => {
                  this.handleComment();
                }}
                color="#512DA8"
                title="Submit"
              />
            </View>

            <View style={styles.modalButtonContainer}>
              <Button
                style={styles.modalButtonContainer}
                onPress={() => {
                  this.closeCommentForm();
                }}
                color="gray"
                title="Cancel"
              />
            </View>
          </View>
        </Modal>
        <RenderComments
          comments={this.props.comments.comments.filter(
            comment => comment.dishId === dishId
          )}
        />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: "center",
    margin: 20
  },
  modalTitle: {
    fontSize: 24,
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
  modalButtonContainer: {
    padding: 10
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(DishDetail);
