-- Une seule candidature active ou traitée par étudiant et par offre.
-- Une candidature retirée est supprimée par le service et peut donc être recréée.
CREATE UNIQUE INDEX applications_offer_student
  ON applications (offer_id, student_id)
  WHERE status <> 'WITHDRAWN';
