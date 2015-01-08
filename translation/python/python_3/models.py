from django.db import models

class Py3Sentence(models.Model):
    sid = models.IntegerField()
    file_path = models.CharField(max_length=100)
    orig_text = models.TextField()
    trans_text = models.TextField(blank=True)

    def __unicode__(self):
        return u'%s %s %s %s' % (self.sid, self.file_path, self.orig_text, self.trans_text)

    class Meta:
        db_table = 'py3_sentences'

class Py3Translation(models.Model):
    sid = models.IntegerField()
    file_path = models.CharField(max_length=100)
    trans_text = models.TextField()
    plus = models.IntegerField()
    minus = models.IntegerField()

    def __unicode__(self):
        return u'%s %s %s %s %s' % (self.sid, self.file_path, self.trans_text, self.plus, self.minus)

    class Meta:
        db_table = 'py3_translations'
