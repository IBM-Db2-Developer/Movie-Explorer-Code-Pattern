import sys
sys.path.append("/database/config/db2fenc1/.local/lib/python3.6/site-packages/")

import nzae
import turicreate as tc

class full_pipeline(nzae.Ae):
	def run_recommendation(self, movies, ratings):
		model = tc.load_model("/database/config/db2fenc1/movie_rec")
		user_prefs = tc.SFrame({"movieId": movies, "ratings": ratings})
		recommendations = model.recommend_from_interactions(user_prefs, k=30)
		for row in recommendations:
			self.output(row["movieId"])

	def _runUdtf(self):
		movies = []
		ratings = []
		count = 0
		for i in self:
			count += 1
			movies.append(i[0])
			ratings.append(i[1])
			if i[2] == count:
				self.run_recommendation(movies, ratings)
		self.done()

full_pipeline.run()
