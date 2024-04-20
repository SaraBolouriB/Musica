import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import AddMusic from "./AddMusic";
import EditMusic from "./Edit&DelMusic";
import EditComment from "./Edit&DelComment";
import Music from "./Music";
import Loader from "../utils/Loader";
import { Row } from "react-bootstrap";
import { NotificationSuccess, NotificationError } from "../utils/Notifications";
import {
  getMusics as getMusicList,
  createMusic, modifyMusic, deleteMusic, 
  createComment,
  like, unlike,
  downloadMusic, play,
  deleteComment,
  modifyComment
} from "../../utils/marketplace";


const Musics = (tokenSymbol) => {
  const [musics, setMusics] = useState([]);
  const [loading, setLoading] = useState(false);

  // function to get the list of musics
  const getMusics = useCallback(async () => {
    try {
      setLoading(true);
      setMusics(await getMusicList());
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading(false);
    }
  });

  const addMusic = async (data) => {
    try {
      setLoading(true);
      const priceStr = data.price;
      data.price = parseInt(priceStr, 10);
      createMusic(data).then(resp => {
        console.log(resp);
        getMusics();
      });
      toast(<NotificationSuccess text="Music added successfully." />);
    } catch (error) {
      console.log({ error });
      toast(<NotificationError text="Failed to create a music." />);
    } finally {
      setLoading(false);
    }
  };

  const edditMusic = async (data) => {
    try {
      setLoading(true);
      const id = data.id;
      delete data['id'];
      if (Object.keys(data).length === 0) {
        deleteMusic(id).then(resp => {
          console.log(resp);
          getMusics();
        });
        toast(<NotificationSuccess text="Music modified successfully." />);
      } else {
        modifyMusic(id, data).then(resp => {
          console.log(resp);
          getMusics();
        });
        toast(<NotificationSuccess text="Music removed successfully." />);
      }     
    } catch (error) {
      console.log({ error });
      toast(<NotificationError text="Failed to process your request." />);
    } finally {
      setLoading(false);
    }
  };

  const buy = async (id, price) => {
    try {
      setLoading(true);
      await downloadMusic(id, price).then(resp => {
        console.log(resp)
        getMusics();
        toast(<NotificationSuccess text="Music bought successfully" />);
      });
    } catch (error) {
      toast(<NotificationError text="Failed to purchase music." />);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (id, data) => {
    try {
      setLoading(true);
      const description = {
        "description": data
      }
      await createComment(id, description).then(resp => {
        console.log(resp)
      });
      toast(<NotificationSuccess text="Comment added successfully." />);
    } catch (error) {
      console.log({ error });
      toast(<NotificationError text="Failed to create a comment." />);
    } finally{
      setLoading(false);
    }
  };

  const editComment = async (data) => {
    try {
      setLoading(true);
      const id = data.id;
      delete data['id'];
      if (Object.keys(data).length === 0) {
        deleteComment(id).then(resp => {
          console.log(resp);
          getMusics();
        });
        toast(<NotificationSuccess text="Music modified successfully." />);
      } else {
        console.log(data);
        modifyComment(id, data).then(resp => {
          console.log(resp);
          getMusics();
        });
        toast(<NotificationSuccess text="Music removed successfully." />);
      }     
    } catch (error) {
      console.log({ error });
      toast(<NotificationError text="Failed to process your request." />);
    } finally {
      setLoading(false);
    }
  };

  const likeMusic = async (id) => {
    try {
      setLoading(true);
      await like(id).then(res => {
        console.log(res);
        getMusics();
      });
    } catch (error) {
      console.log(error);
      toast(<NotificationError text={error} />);
    } finally{
      setLoading(false);
    }
  };

  const unlikeMusic = async (id) => {
    try {
      setLoading(true);
      await unlike(id).then(res => {
        console.log(res);
        getMusics();
        toast(<NotificationError text={res} />);
      });
    } catch (error) {
      console.log(error);
      toast(<NotificationError text={error} />);
    } finally{
      setLoading(false);
    }
  };

  const playMusic = async (id) => {
    try {
      setLoading(true);
      await play(id).then(res => {
         console.log(res.message);
      });
    } catch (error) {
      console.log(error);
      toast(<NotificationError text={error} />);
    } finally{
      setLoading(false);
    }
  }

  useEffect(() => {
    getMusics();
  }, []);

  return (
    <>
      {!loading ? (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="fs-4 fw-bold mb-0">Musics Menu</h1>
            <AddMusic save={addMusic} />
            <EditMusic save={edditMusic} />
            <EditComment save={editComment} />
          </div>
          <Row xs={1} sm={2} lg={3} className="g-3  mb-5 g-xl-4 g-xxl-5">
            {musics.map((_music) => (
              <Music
                tokemMetadata={tokenSymbol}
                music={{
                  ..._music,
                }}
                buy={buy}
                addComment={addComment}
                likeMusic={likeMusic}
                unlikeMusic={unlikeMusic}
                playMusic={playMusic}
              />
            ))}
          </Row>
        </>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default Musics;
