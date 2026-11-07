"""Automated verification test suite for LessonCraft AI."""
import sys
import unittest
from pathlib import Path

# Add backend to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import create_app
from app.models.lesson import LessonStore

class PipelineTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

    def test_sample_inputs_endpoint(self):
        res = self.client.get('/api/lessons/sample-inputs')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertGreaterEqual(len(data['samples']), 2)

    def test_generate_http_lesson(self):
        """Test primary benchmark: HTTP Requests and Responses."""
        payload = {
            "title": "HTTP Requests and Responses",
            "learning_objective": "Explain GET and POST methods and distinguish between 2xx, 4xx, and 5xx response status categories.",
            "target_duration": 45
        }
        res = self.client.post('/api/lessons/generate', json=payload)
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        lesson = data['lesson']

        # Assert 45-min pacing structure
        self.assertEqual(lesson['target_duration'], 45)
        self.assertIn('timeline_breakdown', lesson['content'])
        self.assertEqual(len(lesson['content']['timeline_breakdown']), 5)

        # Assert Research components
        self.assertIn('books', lesson['research'])
        self.assertIn('websites', lesson['research'])
        self.assertIn('videos', lesson['research'])
        self.assertGreaterEqual(len(lesson['content']['supplementary_videos']), 1)
        self.assertGreaterEqual(len(lesson['content']['references']), 1)

        # Assert QC Layer 1 (Factual Accuracy)
        qc1 = lesson['qc_layer_1']
        self.assertEqual(qc1['layer_name'], "QC Layer 1: Research and Factual Accuracy")
        self.assertGreaterEqual(qc1['overall_score'], 80.0)
        self.assertIn('claims_audit', qc1)
        self.assertIn('suggested_improvements', qc1)

        # Assert QC Layer 2 (Instructional Quality)
        qc2 = lesson['qc_layer_2']
        self.assertEqual(qc2['layer_name'], "QC Layer 2: Instructional Quality")
        self.assertGreaterEqual(qc2['overall_score'], 80.0)
        self.assertIn('rubric_breakdown', qc2)

        # Test Apply QC patch
        fix_id = qc1['suggested_improvements'][0]['id']
        patch_res = self.client.post(f"/api/lessons/{lesson['id']}/apply-qc", json={"fix_id": fix_id, "layer": "qc_layer_1"})
        self.assertEqual(patch_res.status_code, 200)

        # Test Exports
        md_res = self.client.get(f"/api/lessons/{lesson['id']}/export/markdown")
        self.assertEqual(md_res.status_code, 200)
        self.assertIn(b"# HTTP Requests and Responses", md_res.data)

        html_res = self.client.get(f"/api/lessons/{lesson['id']}/export/html")
        self.assertEqual(html_res.status_code, 200)
        self.assertIn(b"<!DOCTYPE html>", html_res.data)

        json_res = self.client.get(f"/api/lessons/{lesson['id']}/export/json")
        self.assertEqual(json_res.status_code, 200)

    def test_generate_binary_search_lesson(self):
        """Test secondary algorithm benchmark."""
        payload = {
            "title": "Binary Search Algorithm: Theory, Implementation, and Complexity",
            "learning_objective": "Implement binary search iteratively and recursively, analyze its O(log n) time complexity, and identify boundary condition pitfalls (off-by-one errors).",
            "target_duration": 45
        }
        res = self.client.post('/api/lessons/generate', json=payload)
        self.assertEqual(res.status_code, 201)
        lesson = res.get_json()['lesson']
        self.assertEqual(lesson['target_duration'], 45)
        self.assertGreaterEqual(lesson['qc_layer_1']['overall_score'], 85.0)
        self.assertGreaterEqual(lesson['qc_layer_2']['overall_score'], 85.0)

    def test_error_handling(self):
        """Test error handling for empty/invalid inputs."""
        res_empty = self.client.post('/api/lessons/generate', json={})
        self.assertEqual(res_empty.status_code, 400)

        res_short = self.client.post('/api/lessons/generate', json={"title": "AB", "learning_objective": "short"})
        self.assertEqual(res_short.status_code, 400)

if __name__ == '__main__':
    unittest.main()

