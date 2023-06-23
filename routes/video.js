var express = require('express');
var router = express.Router();
const { dbUrl } = require('../common/dbConfig')
const mongoose = require('mongoose')
const { validate } = require('../common/authenticate');
const { userModel } = require('../Schemas/userSchemas');
const { videoModel } = require('../Schemas/videoSchemas');





mongoose.connect(dbUrl)

/* Add Vedio */
router.post('/add', validate, async (req, res) => {
  console.log("inside")
  try {
    const { userId, title, desc, videoUrl, tags } = req.body;
    const newVideo = new videoModel({
      userId,
      title,
      desc,
      videoUrl,
      tags
    });
    console.log(newVideo)
    const savedVideo = await newVideo.save();
    console.log(savedVideo)
    res.status(200).send({
      message: 'Video added successfully',
      video: savedVideo
    });
  } catch (error) {
    res.status(500).send({
      message: 'Internal Server Error',
      error
    });
  }
});

/* Update Vedio */
router.put('/update/:id', validate, async (req, res) => {
  try {
    const { userId, title, desc, imgUrl, videoUrl, tags } = req.body;
    const videoId = req.params.id;
    const authenticatedUserId = req.user.id;

    if (userId !== authenticatedUserId) {
      return res.status(403).send({
        message: 'You are not authorized to update this video'
      });
    }
    const video = await videoModel.findById(videoId);
    if (!video) {
      return res.status(404).send({
        message: 'Video not found'
      });
    }
    video.title = title;
    video.desc = desc;
    video.imgUrl = imgUrl;
    video.videoUrl = videoUrl;
    video.tags = tags;

    const updatedVideo = await video.save();
    res.status(200).send({
      message: 'Video updated successfully',
      video: updatedVideo
    });
  } catch (error) {
    res.status(500).send({
      message: 'Internal Server Error',
      error
    });
  }
});

/* Delete Vedio */
router.delete('/delete/:id', validate, async (req, res) => {
  try {
    const videoId = req.params.id;
    const authenticatedUserId = req.user.id;
    const video = await videoModel.findById(videoId);
    if (!video) {
      return res.status(404).send({
        message: 'Video not found'
      });
    }
    if (video.userId !== authenticatedUserId) {
      return res.status(403).send({
        message: 'You are not authorized to delete this video'
      });
    }
    await video.remove();
    res.status(200).send({
      message: 'Video deleted successfully'
    });
  } catch (error) {
    res.status(500).send({
      message: 'Internal Server Error',
      error
    });
  }
});

/* Find Vedio */
router.get('/find/:id', async (req, res) => {
  try {
    const video = await videoModel.findOne().select('_id');
    console.log(video)

    if (!video) {
      res.status(400).send({
        message: "video Not Found",
      })
    }
    res.status(200).send({
      message: "Video retrieved successfully",
      video
    })

  } catch (error) {
    res.status(500).json({
      message: 'Internal Server Error',
      error
    });
  }
})

/* Random Vedio */
router.get('/videos/random', async (req, res) => {
  try {
    const videos = await videoModel.aggregate([{ $sample: { size: 40 } }]);
    console.log(videos)
    res.status(200).send(videos);
  } catch (error) {
    res.status(500).send({
      message: 'Internal Server Error',
      error
    });
  }
});


/* Get All Vedio */
router.get('/video/all', async (req, res) => {
  try {
    const videos = await videoModel.find();
    console.log(videos)
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
});

/* Tags */
router.get('/tags', async (req, res) => {
  console.log("inside", req.body)
  try {
    const tags = req.query.tags.split(",");
    console.log(tags);

    const videos = await videoModel.find({ tags: { $in: tags } }).limit(20);
    console.log(videos);

    res.status(200).send(videos);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: 'Internal Server Error',
      error: error.message,
    });
  }
});

/* Search Vedio */
router.get('/search', async (req, res) => {
  const query = req.query.q;
  console.log(query)
  try {
    const videos = await videoModel.find({
      title: { $regex: query, $options: "i" },
    }).limit(40);
    console.log(videos)
    res.status(200).send(videos);
  } catch (err) {
    res.status(500).send({
      message: 'Internal Server Error',
      err
    });
  }
});

/* News Vedio */
router.get('/news', async (req, res) => {
  try {

    const newsVideos = await videoModel.find({ tags: 'news' });
    console.log(newsVideos)
    if (newsVideos.length === 0) {
      return res.status(404).json({
        message: 'No news videos found.',
      });
    }
    res.status(200).json({
      message: 'News videos fetched successfully.',
      newsVideos,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal Server Error',
      error,
    });
  }
});

/* Movies Vedio */
router.get('/movies', async (req, res) => {
  try {
    const movieVideos = await videoModel.find({ tags: 'movies' });
    if (movieVideos.length === 0) {
      return res.status(404).json({
        message: 'No movie videos found.',
      });
    }

    res.status(200).json({
      message: 'Movie videos fetched successfully.',
      movieVideos,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal Server Error',
      error,
    });
  }
});

/* Views Vedio */
router.put('/views/:videoId', async (req, res) => {
  const videoId = req.params.videoId;

  try {
    const video = await videoModel.findById(videoId);
    if (!video) {
      return res.status(404).send({ message: 'Video not found' });
    }

    video.views++;
    await video.save();

    res.status(200).send({ message: 'Views updated successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error', error });
  }
});

/* Trend Vedio */
router.get('/trend', async (req, res) => {
  try {
    const videos = await videoModel.find().sort({ views: -1 }).limit(2);
    console.log(videos);
    res.status(200).send(videos);
  } catch (error) {
    res.status(500).send({
      message: 'Internal Server Error',
      error,
    });
  }
});



module.exports = router;