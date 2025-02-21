from django.db import models

# Create your models here.

#ex1

class RapidFireExercise(models.Model):
    analogy_prompt = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Analogy: {self.analogy_prompt}"
    
class RapidFireResponse(models.Model):
    session_id = models.CharField(max_length=255, null=True, blank=True)
    prompt = models.ForeignKey(RapidFireExercise, on_delete=models.CASCADE, related_name="responses")
    response_audio = models.FileField(upload_to="responses/", null=True, blank=True)
    response_text = models.TextField(null=True, blank=True)
    response_time = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Response to '{self.prompt.analogy_prompt}' at {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}"

class RapidFireAIEval(models.Model):
    response = models.OneToOneField(RapidFireResponse, on_delete=models.CASCADE, related_name="evaluation")
    fluency_score = models.FloatField(null=True, blank=True)
    relevance_score = models.FloatField(null=True, blank=True)
    creativity_score = models.FloatField(null=True, blank = True)
    feedback = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"AI Evaluation for response ID {self.response.id}"
